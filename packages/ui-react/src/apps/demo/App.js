// @ts-nocheck
import { AppCore } from '@nan0web/core'
import DB from '@nan0web/db-browser'
/** @typedef {import('@nan0web/db/types').DB} DBTypes */

/**
 * Demonstration application registry - main UI structure
 *
 * @example
 * const app = new DemoApp({ db, theme, setTheme })
 * const result = await app.run()
 */
export default class DemoApp extends AppCore {
	/**
	 * @param {Object} input
	 * @param {DB} input.db
	 * @param {Object} input.theme
	 * @param {Function} input.setTheme
	 * @param {Function} input.navigate
	 * @param {string} [input.uri='index.html']
	 * @param {string} [input.locale='en']
	 */
	constructor({ db, theme, setTheme, navigate, uri = 'index.html', locale = 'en' }) {
		// Bypass AppCore's strict instanceof DB check (npm vs monorepo class mismatch)
		// Duck-type: if db has .fetch(), it's a valid DB
		const safeDb = db && typeof db.fetch === 'function' ? db : undefined
		super({ db: safeDb, locale })
		// Assign db regardless — it's a valid DBBrowser, just not the same class reference
		if (db) this.db = db
		this.theme = theme
		this.setTheme = setTheme
		this.navigate = navigate
		this.uri = uri

		/**
		 * @type {Map<string, () => Promise<AppCore>>}
		 */
		this.apps = new Map(
			/** @type {Array<[string, () => Promise<AppCore>]>} */ ([
				[
					'SimpleApp',
					async () => {
						const mod = await import('./SimpleApp.js')
						return mod.default.from({ title: 'Simple', uri: this.uri, db, locale })
					},
				],
				[
					'CustomRendererApp',
					async () => {
						const mod = await import('./CustomRendererApp.js')
						return mod.default.from({ title: 'Custom', uri: this.uri, db, locale })
					},
				],
				[
					'NavigationApp',
					async () => {
						const mod = await import('../navigation/App.js')
						const app = mod.default.from({ db, locale })
						app.title = 'Navigation'
						app.uri = this.uri
						return app
					},
				],
				[
					'ThemeSwitcherApp',
					async () => {
						const mod = await import('../theme-switcher/App.js')
						return mod.default.from({ title: 'Theme', uri: this.uri, db, locale })
					},
				],
			]),
		)
	}

	/**
	 * @override
	 * @returns {Promise<Object>}
	 */
	async run() {
		// Register applications within the system
		this.data = {
			uri: this.uri,
			apps: this.apps,
		}

		return {
			content: [
				{
					header: [
						{ h1: ['Demo App'] },
						{
							nav: [
								{
									ul: [
										{ li: [{ a: ['Home'], $href: '/play/index.html' }] },
										{ li: [{ a: ['Theme'], $href: '/play/theme.html' }] },
									],
									$style: { display: 'flex', gap: '1rem', listStyle: 'none', padding: 0 },
								},
							],
						},
					],
					$style: { padding: '1rem', background: '#f5f5f5' },
				},
				{
					p: ['This is a demonstration of the DemoApp component.'],
					$style: { padding: '1rem' },
				},
				{
					div: [
						{
							App: 'SimpleApp',
							$uri: this.uri,
						},
					],
					$style: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' },
				},
				{
					Typography: ['Apps Demo: Simple and Interactive'],
					$variant: 'h2',
					$className: 'mb-4',
					$style: { padding: '1rem' },
				},
			],
		}
	}

	/**
	 * @param {string} path
	 */
	handleNavigation(path) {
		this.uri = path
		this.navigate(path)
	}

	/**
	 * @param {any} input
	 * @returns {DemoApp}
	 */
	static from(input) {
		if (input instanceof DemoApp) return input

		// The "right approach": ensure DB instance is valid according to our framework's core
		if (input.db && !(input.db instanceof DB)) {
			// If it's not a strict instance (e.g. monorepo issue),
			// we can try to wrap it or at least log a warning.
			// But here we try to be compatible.
			console.warn("DemoApp: db is not an instance of Core's DB. Attempting to use as-is.")
		}

		return new DemoApp(input)
	}
}
