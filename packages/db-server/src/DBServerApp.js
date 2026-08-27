import path from 'node:path'
import { ModelAsApp } from '@nan0web/ui-cli'
import DB from '@nan0web/db'
import DBFs from '@nan0web/db-fs'
import { LogConsole } from '@nan0web/log'
import { show, progress } from '@nan0web/ui'
import DBServer from './DBServer.js'

/**
 * DBServerApp - ModelAsApp controller for @nan0web/db-server CLI.
 */
export class DBServerApp extends ModelAsApp {
	static alias = 'nan0db'

	static UI = {
		title: 'NaN0Web REST Database Server',
		init: 'Starting DBServer for root directory: {root}...',
		running: '📡 DBServer is running on http://{host}:{port}',
		explorer: '📁 Web File Explorer: http://{host}:{port}/',
		help: '👉 OpenAPI Spec: http://{host}:{port}/api/help',
	}

	static root = {
		help: 'Data root directory path',
		default: '.',
		positional: true,
		alias: 'r',
	}

	static port = {
		help: 'Listen port',
		errorInUse:
			'Port {port} is already in use by another process. Please specify another port via --port <number>',
		default: 3456,
		alias: 'p',
	}

	static host = {
		help: 'Listen host IP',
		default: '0.0.0.0',
		alias: 'h',
	}

	/**
	 * @param {Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.root = data.root ?? DBServerApp.root.default
		/** @type {number} */
		this.port = Number(data.port ?? DBServerApp.port.default)
		/** @type {string} */
		this.host = String(data.host ?? DBServerApp.host.default)
	}

	/**
	 * Run the DBServerApp logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		const { t } = this._
		const rootDir = path.resolve(this.root)

		yield progress(t(DBServerApp.UI.init, { root: rootDir }))

		const driver = new DBFs.Driver({ root: rootDir })
		const db = new DB({ root: rootDir, driver })
		const logger = new LogConsole()

		let server
		try {
			server = await DBServer.create({
				db,
				port: Number(this.port),
				host: String(this.host),
				logger,
			})
		} catch (/** @type {any} */ err) {
			yield progress(t(DBServerApp.UI.init, { root: rootDir }), 100, { stop: 'error' })
			if (err?.code === 'EADDRINUSE') {
				yield show(t(DBServerApp.UI.errorPort, { port: this.port }), 'error')
				return
			}
			throw err
		}

		// Stop the progress spinner before displaying static success outputs
		yield progress(t(DBServerApp.UI.init, { root: rootDir }), 100, { stop: 'success' })

		const port = server.server.port
		const host = this.host === '0.0.0.0' ? 'localhost' : this.host

		yield show(t(DBServerApp.UI.running, { host, port }), 'success')
		yield show(t(DBServerApp.UI.explorer, { host, port }), 'info')
		yield show(t(DBServerApp.UI.help, { host, port }), 'info')

		// Gracefully handle SIGINT (Ctrl+C) and SIGTERM
		await new Promise((resolve) => {
			const shutdown = async () => {
				try {
					await server.close()
				} catch (e) {}
				resolve(true)
			}
			process.once('SIGINT', shutdown)
			process.once('SIGTERM', shutdown)
		})
	}
}
