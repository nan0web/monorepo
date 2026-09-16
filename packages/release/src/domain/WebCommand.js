import { ModelAsApp, result, show, progress } from '@nan0web/ui'
import { DashboardModel } from './Dashboard/DashboardModel.js'

/**
 * WebCommand - ModelAsApp Subcommand to generate and launch PM-as-Code Web Dashboard.
 */
export default class WebCommand extends ModelAsApp {
	static alias = 'web'

	static UI = {
		title: 'web',
		help: 'Generate and launch PM-as-Code Web Dashboard',
		loading: 'Aggregating release metrics for Web Dashboard...',
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
		help: 'Destination path for HTML dashboard',
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

	async *run() {
		const db = this._?.db || this.db
		let gitTelemetry = null
		try {
			gitTelemetry = await import('../utils/nodejs/GitTelemetry.js')
		} catch {}
		const dashboardModel = new DashboardModel(
			{ registryFile: this.registryFile || 'releases.txt' },
			{ db, gitTelemetry }
		)
		for await (const p of dashboardModel.aggregateStream()) {
			yield progress(`[${p.current}/${p.total}] Scanning ${p.project}...`, p.current, p.total, {
				id: 'web-dashboard',
			})
		}
		const summary = dashboardModel.summary
		const projects = dashboardModel.projects

		// Dynamically load ReleaseDashboard from release.app if available or render inline
		let html = ''
		try {
			const { ReleaseDashboard } =
				await import('../../../../apps/release.app/src/ui/web/ReleaseDashboard.js')
			const dashboard = new ReleaseDashboard({ summary, projects })
			html = dashboard.render()
		} catch (err) {
			html = `<!DOCTYPE html><html><body><h1>Dashboard: ${summary.totalProjects} projects</h1><p>${err.message}</p></body></html>`
		}

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

				if (typeof process !== 'undefined' && process.stdin) {
					await new Promise((resolve) => {
						process.on('SIGINT', () => {
							server.close()
							resolve(null)
						})
					})
				}
			} catch (err) {
				yield show(
					`⚠️ Не вдалося запустити HTTP сервер на порті ${this.port}: ${err.message}`,
					'error'
				)
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

export { WebCommand }
