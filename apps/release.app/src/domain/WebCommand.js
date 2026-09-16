import { ModelAsApp } from '@nan0web/ui'
import { show, progress, result } from '@nan0web/ui'
import { DashboardModel } from '@nan0web/release'
import { ReleaseDashboard } from '../ui/web/ReleaseDashboard.js'

/**
 * WebCommand - CLI Subcommand to generate and optionally serve PM-as-Code Web Dashboard.
 */
export class WebCommand extends ModelAsApp {
	static alias = 'web'

	static UI = { ...ModelAsApp.UI,
		title: 'PM-as-Code Web Dashboard Generator',
		loading: 'Aggregating release telemetry and generating HTML Dashboard...',
		generated: '✨ Web Dashboard успішно згенеровано: {$path}',
		serving: '🌐 Web Dashboard запущено: http://localhost:{$port} (Натисніть Ctrl+C для зупинки)',
	}

	static registryFile = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
		alias: 'f',
	}

	static out = {
		help: 'Destination path for generated HTML dashboard',
		default: 'apps/release.app/play/index.html',
		type: 'string',
		alias: 'o',
	}

	static port = {
		help: 'Port to serve HTML dashboard over HTTP (e.g. 3333)',
		default: 0,
		type: 'number',
		alias: 'p',
	}

	static open = {
		help: 'Automatically open in browser',
		default: false,
		type: 'boolean',
	}

	/**
	 * @param {Partial<WebCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.registryFile = String(data.registryFile || 'releases.txt')
		/** @type {string} */ this.out = String(data.out || 'apps/release.app/play/index.html')
		/** @type {number} */ this.port = Number(data.port ?? options.port ?? 0)
		/** @type {boolean} */ this.open = Boolean(data.open ?? options.open ?? false)
	}

	/**
	 * Execute web dashboard generation & serving
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { status: string, outPath: string, summary: any, projects: any[], port?: number }, any>}
	 */
	async *run() {
		const db = this._.db
		if (!db) {
			throw new Error('Database instance ({ db }) is required to execute WebCommand')
		}

		const dashboardModel = new DashboardModel({ registryFile: this.registryFile || 'releases.txt' }, { db })
		for await (const p of dashboardModel.aggregateStream()) {
			yield progress(`[${p.current}/${p.total}] Scanning ${p.project}...`, p.current, p.total, { id: 'web-dashboard' })
		}
		const summary = dashboardModel.summary
		const projects = dashboardModel.projects

		const dashboard = new ReleaseDashboard({ summary, projects })
		const html = dashboard.render()

		const outPath = this.out || 'apps/release.app/play/index.html'
		await db.saveDocument(outPath, html)

		yield progress('', 100, { id: 'web-dashboard', stop: 'success' })
		yield show(WebCommand.UI.generated.replace('{$path}', outPath), 'info')

		if (this.port > 0) {
			try {
				const { createServer } = await import('node:http')
				const server = createServer((req, res) => {
					res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
					res.end(html)
				})
				server.listen(this.port)
				yield show(WebCommand.UI.serving.replace('{$port}', String(this.port)), 'success')

				if (this.open) {
					try {
						const { exec } = await import('node:child_process')
						exec(`open http://localhost:${this.port}`)
					} catch {}
				}

				// Keep server running in standalone CLI process
				if (typeof process !== 'undefined' && process.stdin) {
					await new Promise((resolve) => {
						process.on('SIGINT', () => {
							server.close()
							resolve(null)
						})
					})
				}
			} catch (err) {
				yield show(`⚠️ Не вдалося запустити HTTP сервер на порті ${this.port}: ${err.message}`, 'error')
			}
		} else if (this.open) {
			try {
				const { exec } = await import('node:child_process')
				exec(`open "${outPath}"`)
			} catch {}
		}

		return result({
			status: 'ok',
			outPath,
			summary,
			projects,
			port: this.port,
		})
	}
}

export default WebCommand
