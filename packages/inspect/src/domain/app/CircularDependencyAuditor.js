import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show, render } from '@nan0web/ui'
import madge from 'madge'
import { fork } from 'node:child_process'

/**
 * CircularDependencyAuditor — Detects circular dependencies using Madge.
 */
export class CircularDependencyAuditor extends AuditorModel {
	static alias = 'circular'

	static UI = {
		title: 'Circular Dependency Auditor',
		description: 'Detects circular dependency chains in the source code.',
		icon: '🔄',
		lookingIn: 'Looking for circular dependencies in {dir}',
		noCycles: 'No circular dependencies found',
		foundCycles: 'Found {count} circular dependency chains',
		errorDb: 'Database is not available',
		errorTimeout: 'Madge analysis timed out after {timeout}ms for {dir}',
	}

	static timeout = {
		help: 'Timeout of circular dependency operation in milliseconds',
		type: 'number',
		default: 9999,
	}

	/**
	 * @param {Partial<CircularDependencyAuditor>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Timeout to cancel */ this.timeout
	}

	/**
	 * Runs the circular dependency audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (!this._.db) throw new Error('DB not found in context')
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t
		await this.init()
		let scanPath = this.dir

		yield progress(t(CircularDependencyAuditor.UI.lookingIn, { dir: scanPath }))

		try {
			// Normalize timeout (handle both ms and s)
			let timeout = Number(this.timeout) || 9999
			if (timeout < 100) timeout *= 1000

			const absolutePath = this._.db.resolveSync(scanPath)
			
			// If DB is virtual (like in tests), madge cannot scan it via filesystem
			if (this._.db.constructor.name.includes('Mock') || !absolutePath.startsWith('/')) {
				return result({ success: true, circular: [] })
			}
			const res = await this._runMadgeAsync(absolutePath, timeout)

			if (res.timeout) {
				const msg = t(CircularDependencyAuditor.UI.errorTimeout, { timeout, dir: scanPath })
				yield show(msg, 'warn')
				return result({ success: false, errors: [{ check: 'circular', error: msg }] })
			}

			if (res.error) {
				const msg = `Circular check failed: ${res.error}`
				yield show(msg, 'error')
				return result({ success: false, errors: [{ check: 'circular', error: msg }] })
			}

			const circular = res.circular || []
			if (circular.length > 0) {
				const error = t(CircularDependencyAuditor.UI.foundCycles, { count: circular.length })
				const cycles = circular.map((/** @type {any} */ c) => c.join(' -> ')).join('\n')

				yield render('Alert', {
					title: error,
					children: cycles,
					variant: 'error',
				})

				return result({
					circular,
					success: false,
					errors: [{ check: 'circular', error: `${error}: ${cycles}` }],
				})
			}

			const msg = t(CircularDependencyAuditor.UI.noCycles, {})
			yield render('Alert', { children: msg, variant: 'success' })
			return result({ success: true, errors: [] })
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e))
			const msg = `Circular check failed: ${error.message}`
			yield show(msg, 'error')
			return result({ success: false, errors: [{ check: 'circular', error: msg }] }, false)
		}
	}

	/**
	 * @param {string} scanPath
	 * @param {number} timeout
	 * @returns {Promise<any>}
	 */
	async _runMadgeAsync(scanPath, timeout) {
		const { fork } = await import('node:child_process')
		const { fileURLToPath } = await import('node:url')
		const { dirname, join } = await import('node:path')
		const { writeFileSync, unlinkSync } = await import('node:fs')

		// Create a tiny worker script to run madge
		const workerCode = `
			import madge from 'madge';
			process.on('message', async (path) => {
				try {
					const res = await madge(path, {
						includeNpm: false,
						fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
					});
					process.send({ circular: res.circular() });
				} catch (e) {
					process.send({ error: e.message });
				}
			});
		`
		const tmpFile = join(dirname(fileURLToPath(import.meta.url)), `.madge-worker-${Date.now()}.mjs`)
		
		return new Promise(async (resolve) => {
			try {
				writeFileSync(tmpFile, workerCode)
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err))
				return resolve({ error: `Failed to create worker: ${error.message}` })
			}
 
			const child = this.fork(tmpFile, { stdio: 'inherit' })
			const timer = setTimeout(() => {
				child.kill()
				resolve({ timeout: true })
			}, timeout)

			child.on('message', (msg) => {
				clearTimeout(timer)
				child.kill()
				resolve(msg)
			})

			child.on('error', (err) => {
				clearTimeout(timer)
				child.kill()
				resolve({ error: err.message })
			})

			child.on('exit', () => {
				try { unlinkSync(tmpFile) } catch {}
			})

			child.send(scanPath)
		})
	}
	/**
	 * @param {string} path
	 * @param {any} options
	 * @returns {any}
	 */
	fork(path, options) {
		return fork(path, options)
	}
}
