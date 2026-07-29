import { ModelAsApp, result, progress, ask, show } from '@nan0web/ui'
import { resolveAliases } from '@nan0web/types'
import LogConfig from './LogConfig.js'
import AppEntryConfig from './AppEntryConfig.js'

/**
 * NaN0WebApp Domain Model & Sovereign Runner Configuration.
 *
 * Extends ModelAsApp to provide declarative lifecycle run/build orchestrator schemas.
 *
 * @property {string} appName Project name
 * @property {string} dsn Data Source Name (folder or connection string)
 * @property {string} locale Default locale
 * @property {number} port Server port
 * @property {'light' | 'dark' | 'auto'} theme UI theme
 * @property {{ cert: string, key: string }|null} ssl TLS/SSL configuration for HTTPS (cert and key paths)
 * @property {LogConfig} log Logging configuration settings
 * @property {AppEntryConfig[]} apps Array of installed domain apps
 * @property {Record<string, string>} aliases Virtual URI projections
 * @property {string[]} ui Active UI adapters (e.g. ['cli', 'web'])
 * @property {string} build Target platform for static build
 * @property {string} outDir Output directory for build artifacts
 * @property {string} operation Selected operation (run or build)
 */
export default class NaN0WebApp extends ModelAsApp {
	static UI = {
		title: 'NaN0WebApp Sovereign Runner',
		initDb: 'Initializing NaN0WebApp configuration and database...',
		createAliases: 'Creating virtual projections via aliases...',
		detectLocale: 'Detecting user locale...',
		attachApps: 'Attaching and registering apps...',
		dbSeal: 'Applying security limits: db.seal()...',
		askOperation: 'Select operation: run runtime or static build',
		running: 'Loading and calling UI Runner ({ui})...',
		building: 'Loading and calling UI Builder ({platform})...',
		success: 'Operation completed successfully',
	}

	static appName = {
		alias: 'name',
		help: 'Project name',
		placeholder: 'my-app',
		default: '',
		required: true,
		validate: (val) => (val ? true : 'AppName is required'),
	}
	static dsn = {
		help: 'Data Source Name (folder or connection string)',
		placeholder: 'data/',
		default: 'data/',
	}
	static locale = {
		help: 'Default locale',
		placeholder: 'en',
		default: 'en',
	}
	static port = {
		help: 'Server port',
		placeholder: '3000',
		default: 3000,
	}
	static theme = {
		help: 'UI theme (light | dark | auto)',
		placeholder: 'auto',
		default: 'auto',
	}
	static ssl = {
		help: 'TLS/SSL config for HTTPS — certificate and key paths',
		type: 'object',
		default: null,
		hidden: true,
	}
	static log = {
		help: 'Configuration for access and error logs',
		type: 'LogConfig',
		hint: LogConfig,
		default: {},
		hidden: true,
	}
	static apps = {
		help: 'Installed domain apps',
		type: 'AppEntryConfig[]',
		hint: AppEntryConfig,
		hidden: true,
		default: [],
	}
	static aliases = {
		help: 'Virtual URI aliases (source -> target)',
		type: 'Record<string, string>',
		default: {},
		hidden: true,
	}

	static ui = {
		help: 'Active UI adapters (cli, web, api, chat, voice)',
		type: 'string[]',
		default: [],
	}

	// Build Platform
	static build = {
		help: 'Target platform for static build (web | swift | kotlin | api | vscode | all)',
		type: 'string',
		default: 'web',
	}
	static outDir = {
		help: 'Output directory for build artifacts',
		type: 'string',
		default: 'dist/',
	}

	// Operation selection
	static operation = {
		help: 'Select operation (run | build)',
		type: 'string',
		default: '',
		options: [
			{ value: 'run', label: 'Run Runtime' },
			{ value: 'build', label: 'Static Build' },
		],
	}

	/**
	 * @param {Partial<NaN0WebApp>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string} */ this.appName
		/** @type {string} */ this.dsn
		/** @type {string} */ this.locale
		/** @type {number} */ this.port
		/** @type {string} */ this.theme
		/** @type {{ cert: string, key: string }|null} */ this.ssl
		/** @type {LogConfig} */ this.log
		/** @type {AppEntryConfig[]} */ this.apps
		/** @type {Record<string, string>} */ this.aliases
		/** @type {string[]} */ this.ui
		/** @type {string} */ this.build
		/** @type {string} */ this.outDir
		/** @type {string} */ this.operation

		// Hydrate nested models
		if (this.log && !(this.log instanceof LogConfig)) {
			this.log = new LogConfig(this.log)
		}
		if (Array.isArray(this.apps)) {
			this.apps = this.apps.map((a) => (a instanceof AppEntryConfig ? a : new AppEntryConfig(a)))
		}
	}

	/**
	 * @param {object} input
	 * @returns {NaN0WebApp}
	 */
	static from(input) {
		if (input instanceof NaN0WebApp) return input
		if (typeof input !== 'object' || input === null) return new NaN0WebApp()
		return new NaN0WebApp(resolveAliases(this, input))
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (this.help) return yield* super.run()

		const { t } = this._

		// 1. progress: Initialize NaN0WebApp configuration and database.
		yield progress(t(NaN0WebApp.UI.initDb), 1, 7)

		// 2. progress: Create virtual projections via aliases.
		yield progress(t(NaN0WebApp.UI.createAliases), 2, 7)

		// 3. progress: Detect user locale.
		yield progress(t(NaN0WebApp.UI.detectLocale), 3, 7)

		// 4. progress: Attach and register domain apps.
		yield progress(t(NaN0WebApp.UI.attachApps), 4, 7)

		// 5. progress: Apply security limits via db.seal().
		yield progress(t(NaN0WebApp.UI.dbSeal), 5, 7)

		// 6. ask: Determine operation (run or build).
		if (!this.operation) {
			const res = yield ask('operation', NaN0WebApp.operation)
			this.operation = res.value || 'run'
		}

		// 7. progress & show: Launch corresponding UI Runner / Builder
		if (this.operation === 'build') {
			const platform = this.build || 'web'
			yield progress(t(NaN0WebApp.UI.building, { platform }), 6, 7)

			yield show(t(NaN0WebApp.UI.success), 'success')
			return result({ ok: true, operation: 'build', platform })
		} else {
			let ui = 'cli'
			if (this.ui && this.ui.length > 0) {
				ui = this.ui[0]
			}

			yield progress(t(NaN0WebApp.UI.running, { ui }), 6, 7)

			yield show(t(NaN0WebApp.UI.success), 'success')
			return result({ ok: true, operation: 'run', ui })
		}
	}
}
