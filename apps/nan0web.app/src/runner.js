// @ts-nocheck
import { EventEmitter } from 'node:events'
import { DBFS, DBwithFSDriver } from '@nan0web/db-fs'
import { NaN0WebConfig, Navigation } from './domain/index.js'
import AppLogger from './utils/AppLogger.js'
import PagesRouter from './router/PagesRouter.js'
import Renderer from './renderer/Renderer.js'
import AppRegistry from './registry/AppRegistry.js'
import IntentResolver from './registry/IntentResolver.js'
import { createT } from '@nan0web/types'

const DB = Object.getPrototypeOf(DBFS)

/**
 * Tiny I18n wrapper for AppRunner to support dynamic vocabulary loading.
 */
class I18n {
	constructor({ locale = 'en' } = {}) {
		this.locale = locale
		this.vocabulary = {}
		this.t = createT(this.vocabulary, this.locale)
	}
	/** @param {object} data */
	load(data) {
		Object.assign(this.vocabulary, data)
		this.t = createT(this.vocabulary, this.locale)
	}
}

// Re-export for backward compat (cli.js imports from here)
export { NaN0WebConfig }

/**
 * Universal App Runner — Phase 2
 *
 * Bootstraps the Data-Driven OS based on nan0web.config.*
 * Uses `async function* run()` pattern for CLI compatibility.
 *
 * Phase 2 additions:
 *   - PagesRouter: pages.yaml → automatic routing
 *   - Renderer: OLMUI universal block renderer
 *   - App Attach: db.extract() → micro-app branches
 */
export class AppRunner extends EventEmitter {
	/** @type {any} */
	db

	/** @type {PagesRouter} */
	router

	/** @type {Renderer | null} */
	renderer

	/** @type {AppLogger | null} */
	logger

	/**
	 * @param {string | { cwd?: string, db?: import('@nan0web/db-fs').DBwithFSDriver, dsn?: string, port?: number|string, locale?: string }} [options]
	 */
	constructor(options = {}) {
		super()
		this.renderer = null
		this.logger = null
		if (typeof options === 'string') options = { cwd: options }
		/** @type {any} */
		this.options = options
		this.cwd = options.cwd || process.cwd()
		/** @type {NaN0WebConfig | null} */
		this.config = null
		/** @type {import('@nan0web/db-fs').DBwithFSDriver | null} */
		this.dataDb = null
		/** @type {object} */
		this.state = {}
		this.i18n = new I18n({ locale: options.locale || 'en' })
		this.router = new PagesRouter()
		/** @type {AppRegistry} */
		this.registry = new AppRegistry()
		/** @type {IntentResolver | null} */
		this.intents = null
		/** @type {Map<string, import('@nan0web/db-fs').DBwithFSDriver>} */
		this.apps = new Map()
		// IoC: accept pre-built DB for testability
		this.db = options.db
	}

	/**
	 * Main execution generator — yields status messages for CLI rendering.
	 * @yields {string}
	 */
	async *run() {
		yield '🚀 Booting NaN0Web OS Engine...\n'

		// 1. Connect DB (platform-agnostic) — skip if injected via IoC
		if (!this.db) {
			this.db = new DBFS({ cwd: this.cwd })
			await this.db.connect()
		}

		// Mount standard virtual spaces if not already mounted
		if (!this.db.mounts?.has('@app')) {
			let appDb
			if (this.db.constructor.name === 'DBFS') {
				appDb = new DBFS({ cwd: this.cwd, root: '', console: this.db.console })
			} else {
				appDb = new DB({ cwd: '.', data: this.db.data, meta: this.db.meta, console: this.db.console })
				appDb.normalize = (...args) => DB.prototype.normalize.call(appDb, ...args).replace(/^\//, '')
			}
			this.db.mount('@app', appDb)
		}
		if (!this.db.mounts?.has('~')) {
			let homeDb
			if (this.db.constructor.name === 'DBFS') {
				const appName = this.options.appName || 'nan0web'
				homeDb = new DBFS({ cwd: (await import('node:os')).homedir(), root: `.${appName}`, console: this.db.console })
			} else {
				homeDb = new DB({ cwd: '.', data: this.db.data, meta: this.db.meta, console: this.db.console })
				homeDb.normalize = (...args) => DB.prototype.normalize.call(homeDb, ...args).replace(/^\//, '')
			}
			this.db.mount('~', homeDb)
		}

		// 2. Fetch config from DBFS (try exact paths to avoid dot-extension detection issues)
		let rawConfig = null
		let configPath = null
		const configFiles = [
			'nan0web.config.yaml',
			'nan0web.config.yml',
			'nan0web.config.json',
			'nan0web.config.nan0',
			'nan0web.nan0',
			'nan0web.yaml',
			'nan0web.json'
		]
		for (const file of configFiles) {
			try {
				rawConfig = await this.db.fetch(`@app/${file}`)
				if (rawConfig) {
					configPath = `@app/${file}`
					break
				}
			} catch (e) {
				// ignore
			}
		}

		if (rawConfig) {
			this.config = NaN0WebConfig.from(rawConfig)
			yield `✅ Loaded config from DBFS: ${configPath}`
		} else {
			if (this.options.dsn) {
				this.config = new NaN0WebConfig({ dsn: this.options.dsn })
				yield 'ℹ️ No config file found, using default with provided DSN.'
			} else {
				yield '⚠️ No nan0web.config detected.'
				yield '💡 Run `nan0web config` to initialize.'
				return
			}
		}

		if (this.options.apps && Array.isArray(this.options.apps)) {
			if (!this.config.apps) this.config.apps = []
			for (const app of this.options.apps) {
				if (!this.config.apps.some(a => a.src === app.src)) {
					this.config.apps.push(app)
				}
			}
		}

		// Auto-detect UI if missing
		if (!this.config.ui || this.config.ui.length === 0) {
			try {
				const pkg = (await this.db.fetch('@app/package.json')) ?? {}
				const exports = pkg.exports || {}
				const uiTypes = Object.keys(exports).filter((k) => k.startsWith('./ui/'))
				this.config.ui = uiTypes.map((k) => k.replace('./ui/', ''))
			} catch (e) {
				// ignore
			}
		}

		if (this.options.dsn) {
			this.config.dsn = this.options.dsn
		}
		if (this.options.port) {
			this.config.port = Number(this.options.port)
		}
		if (this.options.locale) {
			this.config.locale = this.options.locale
		}
		yield `📂 Data Source: ${this.config.dsn}`

		// DSN Factory: Initialize appropriate DB driver based on URI scheme
		if (this.config.dsn.includes('://')) {
			const protocol = this.config.dsn.split('://')[0]
			switch (protocol) {
				case 'http':
				case 'https': {
					const { BrowserDB } = await import('@nan0web/db-browser')
					this.dataDb = new BrowserDB({ root: this.config.dsn, console: this.db.console })
					if (typeof this.dataDb.connect === 'function') await this.dataDb.connect()
					break
				}
				default:
					throw new Error(
						`Unsupported DSN protocol: '${protocol}://' (currently only http/https and local fs/ folders are fully implemented)`,
					)
			}
		} else {
			this.dataDb = this.db.extract(this.config.dsn)
		}

		if (this.config && this.config.aliases && Object.keys(this.config.aliases).length > 0) {
			if (this.dataDb) this.dataDb.aliases = this.config.aliases
			yield `🔀 Virtual Aliases: ${Object.keys(this.config.aliases).length} active`
		}

		// 3. Detect locale from environment
		const locale = (this.config ? this.config.locale : '') || process.env.LANG?.split('.')[0]?.split('_')[0] || 'en'
		yield `🌐 Locale: ${locale}`

		// 4. Load global state (fetch merged index)
		yield '📦 Building Global State...'
		this.state = await this.#buildState(locale)
		yield `📑 State loaded: ${Object.keys(this.state).length} top-level keys`

		// 5. Load i18n translations
		if (this.state.langs) {
			const langList = Array.isArray(this.state.langs.children)
				? this.state.langs.children.map((l) => l.code || l.id)
				: Object.keys(this.state.langs)
			yield `🗣️ Available languages: ${langList.join(', ')}`
		}
		if (this.state.t) {
			this.i18n.locale = locale
			this.i18n.load(this.state.t)
			yield `📖 Translations loaded: ${Object.keys(this.state.t).length} keys`
		}

		// 6. Phase 2: Pages Router
		this.router.load(this.state)
		if (this.router.size > 0) {
			yield `🗺️ Pages router: ${this.router.size} routes registered`
		} else {
			yield '📄 No explicit pages config found — building nav tree from directories...'
			const { buildNavTree } = await import('./utils/buildNavTree.js')
			const dirIndex = this.config?.directoryIndex || 'index'
			if (this.dataDb) {
				this.state.pages = await buildNavTree(this.dataDb, '.', { directoryIndex: dirIndex })
			}
			this.router.load(this.state)
			yield `🗺️ Pages router: ${this.router.size} auto-routes registered (index: ${dirIndex})`
		}

		// 7. Phase 2: Initialize Renderer
		this.renderer = new Renderer(this.state)
		yield '🎨 OLMUI Renderer initialized.'

		// 9. Initialize Logger
		if (this.config.log && this.config.log.enabled) {
			this.logger = new AppLogger(this.config.log, this.cwd)
			await this.logger.init()
			yield `📝 Logger: ${this.config.log.rotation} rotation → ${this.config.log.dir}`
		}

		// 8. Phase 5b: Attach micro-apps via Registry
		if (this.config.apps && Array.isArray(this.config.apps) && this.config.apps.length > 0) {
			yield '\n📦 Loading Micro-Apps...'
			for (const appDef of this.config.apps) {
				yield* this.#attachApp(appDef)
			}
			yield `🔌 App Registry: ${this.registry.list().length} apps loaded [${this.registry.list().join(', ')}]`
			this.intents = new IntentResolver(this.registry, this.apps)
		}

		if (/** @type {any} */ (process).isBun) {
			yield '⚡ Running in Bun runtime.'
		}

		// Phase 6: Security Freeze
		if (this.db && typeof this.db.seal === 'function') {
			this.db.seal()
			yield '🛡️ Security Protocol: db.seal()'
		}

		yield '\n🟢 Engine Ready. Sovereign Web is online.'
	}

	/**
	 * Attach a micro-app as a data branch.
	 * Inherits dsn and locale from parent config when not specified.
	 *
	 * Config example:
	 *   apps:
	 *     - name: deposits
	 *       src: "@bank/deposits"
	 *     - name: credits
	 *       src: "@bank/credits"
	 *       locale: en
	 *
	 * @param {import('./domain/AppEntryConfig.js').default} appDef
	 * @yields {string}
	 */
	async *#attachApp(appDef) {
		const name = appDef.name
		if (!name) {
			yield `⚠️ Invalid app definition: ${JSON.stringify(appDef)}`
			return
		}

		// Успадкування від батьківського конфігу
		const dsn = appDef.dsn || (this.config ? this.config.dsn : '')
		const locale = appDef.locale || (this.config ? this.config.locale : 'en')

		try {
			const appDb = new DBwithFSDriver({ cwd: dsn })
			await appDb.connect()

			// Read package.json to discover UI adapters from exports
			let pkg = {}
			try {
				const path = await import('node:path')
				const fs = await import('node:fs/promises')
				const pkgName = appDef.src.split('/').pop()
				const appPath = path.join(this.cwd || process.cwd(), 'apps', pkgName, 'package.json')
				const packagePath = path.join(this.cwd || process.cwd(), 'packages', pkgName, 'package.json')
				
				let pkgFilePath = null
				try {
					await fs.access(appPath)
					pkgFilePath = appPath
				} catch {
					try {
						await fs.access(packagePath)
						pkgFilePath = packagePath
					} catch {
						// ignore
					}
				}

				if (pkgFilePath) {
					const pkgContent = await fs.readFile(pkgFilePath, 'utf8')
					pkg = JSON.parse(pkgContent)
				} else {
					const resolved = await import.meta.resolve(`${appDef.src}/package.json`)
					const pkgPath = new URL(resolved).pathname
					const pkgContent = await fs.readFile(pkgPath, 'utf8')
					pkg = JSON.parse(pkgContent)
				}
			} catch (e) {
				pkg = (await appDb.fetch('package.json')) ?? {}
			}

			if (pkg.name || pkg.exports) {
				const manifest = this.registry.registerFromPackage(pkg)
				const adapters = manifest.adapters
				yield `  📋 ${name}: ${adapters.length ? adapters.join(', ') : 'no ui adapters'}`
			} else {
				// Fallback: register minimal manifest from entry config
				this.registry.register({ appName: name, src: appDef.src })
				yield `  📋 ${name}: no package.json, registered from config`
			}

			// Load app's index into state under its namespace
			const appIndex = await appDb.fetch('index')

			if (appDef.isolation) {
				// App Isolation (Phase 5): Hide from global scope if isolated
				this.state[name] = appIndex
				yield `  🔒 ${name}: Isolated state (Phase 5)`
			} else {
				this.state[name] = appIndex
			}

			this.apps.set(name, appDb)
			yield `  ✅ ${name} attached (dsn: ${dsn}, locale: ${locale})`
			this.emit('change', this.state)
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : String(err)
			yield `  ⚠️ Failed to attach ${name}: ${errMsg}`
		}
	}

	/**
	 * Render a page by URL path.
	 * Combines Router + Renderer for full data-bound rendering.
	 *
	 * @param {string} urlPath - URL path (e.g. '/cases')
	 * @returns {Promise<{ page: import('./domain/Page.js').default | null, blocks: object[], breadcrumbs: import('./domain/Page.js').default[] }>}
	 */
	async renderPage(urlPath) {
		const start = performance.now()
		
		let cleanPath = urlPath
		if (cleanPath === '' || cleanPath === '/') {
			if (this.router.resolve('')) {
				cleanPath = ''
			} else {
				const defaultLocale = this.config?.locale || 'en'
				cleanPath = '/' + defaultLocale
			}
		}

		const { page, breadcrumbs } = this.router.match(cleanPath)

		if (!page) {
			const ms = Math.round((performance.now() - start) * 10) / 10
			if (this.logger) {
				this.logger.access({ method: 'GET', path: urlPath, status: 404, ms })
			}
			return {
				page: null,
				blocks: [{ h1: '404' }, { p: `Page not found: ${urlPath}` }],
				breadcrumbs: [],
			}
		}

		// Phase 5: Dynamic Source Data Fetching
		// If page has a source but its not in state, load it from DB
		if (page.source) {
			const segments = page.source.split('.')
			let current = this.state
			let missing = false
			for (const seg of segments) {
				if (current == null || typeof current !== 'object' || current[seg] === undefined) {
					missing = true
					break
				}
				current = current[seg]
			}

			if (missing) {
				try {
					const doc = this.dataDb ? await this.dataDb.fetch(page.source.replace(/\./g, '/')) : null
					if (doc) {
						// Inject into state under its path
						let target = this.state
						for (let i = 0; i < segments.length - 1; i++) {
							const seg = segments[i]
							if (!target[seg]) target[seg] = {}
							target = target[seg]
						}
						target[segments[segments.length - 1]] = doc
					}
				} catch (err) {
					const errMsg = err instanceof Error ? err.message : String(err)
					console['warn'](`⚠️ Failed to fetch page source (${page.source}): ${errMsg}`)
				}
			}
		}

		const blocks = this.renderer ? this.renderer.render(page) : []
		const ms = Math.round((performance.now() - start) * 10) / 10

		if (this.logger) {
			this.logger.access({ method: 'GET', path: urlPath, status: 200, ms })
		}

		return { page, blocks, breadcrumbs }
	}

	/**
	 * Resolve a `<nan0-sandbox>` intent — delegate control to a sub-app.
	 *
	 * @param {{ src: string, url?: string, ui?: string }} intent
	 * @returns {Promise<object[]>} - Array of output messages/blocks from the sub-app
	 */
	async resolveIntent(intent) {
		if (!this.intents) {
			return [{ error: 'No apps registered (IntentResolver not initialized)' }]
		}
		const results = []
		for await (const output of this.intents.resolve(intent)) {
			results.push(output)
		}
		return results
	}



	/**
	 * Build the holistic Global State.
	 *
	 * Pattern:
	 *   const globalIndex = await db.fetch("index")       → global data + _/t.yaml (en)
	 *   const localeDb    = await db.extract(locale)       → data/uk/
	 *   const localeIndex = await localeDb.fetch("index")  → locale-specific data + t
	 *
	 * @param {string} locale
	 * @returns {Promise<object>}
	 */
	async #buildState(locale) {
		const state = {}
		if (!this.dataDb) return state

		// 1. Load global index (data/_/t.yaml, data/_/langs.yaml, etc.)
		try {
			const globalIndex = await this.dataDb.fetch('index')
			if (globalIndex) {
				Object.assign(state, globalIndex)

				// Feature: Auto-load translations from 't' key if present
				if (state.t) {
					this.i18n.load(state.t)
				}
			}
		} catch (e) {
			// Skip if global index is missing
		}

		// 1b. Auto-detect locales if missing
		if (!state.langs) {
			const { detectLocales } = await import('./utils/locales.js')
			const autoLangs = await detectLocales(this.dataDb)
			if (Object.keys(autoLangs).length > 0) {
				state.langs = autoLangs
			}
		}

		// 2. Load locale-specific data
		if (locale && locale !== 'en') {
			try {
				const localeDb = this.dataDb.extract(locale)
				const localeIndex = await localeDb.fetch('index')
				// Merge locale translations over global
				if (localeIndex.t) {
					state.t = { ...(state.t || {}), ...localeIndex.t }
				}
				// Merge other locale-specific data
				for (const [key, val] of Object.entries(localeIndex)) {
					if (key !== 't') state[key] = val
				}
			} catch {
				console['debug'](`No locale data found for: ${locale}`)
			}
		}

		// 3. Typify Domain Models in State
		if (state.nav && Array.isArray(state.nav)) {
			state.nav = state.nav.map((n) => new Navigation(n))
		}

		return state
	}

	/**
	 * Update app state and notify observers.
	 * @param {string} key
	 * @param {any} value
	 */
	updateState(key, value) {
		this.state[key] = value
		this.emit('change', this.state)
	}

	/**
	 * Simple start() for non-generator usage.
	 * Consumes run() and prints to console.info.
	 */
	async start() {
		for await (const msg of this.run()) {
			console['info'](msg)
		}
	}

	/**
	 * Graceful shutdown — close logger streams and DB connections.
	 */
	stop() {
		if (this.logger) {
			this.logger.close()
			this.logger = null
		}
		for (const [, appDb] of this.apps) {
			if (typeof appDb.disconnect === 'function') appDb.disconnect()
		}
		this.apps.clear()
	}
}

// Auto-start if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
	const runner = new AppRunner()
	runner.start()
}
