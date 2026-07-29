import { show, progress, result, ask } from '@nan0web/ui'
import { ModelAsApp } from './ModelAsApp.js'
import { Data } from '@nan0web/db'

/** @typedef {import('@nan0web/ui').Intent} Intent */
/** @typedef {import('@nan0web/ui').ModelAsAppOptions & { appName?: string }} AppOptionsWithName */

/**
 * App — NaN•Web CLI Runner (Model-as-App v2).
 *
 * Encapsulates all execution modes of nan0cli:
 * 1. Remote OLMUI thin client (HTTP/HTTPS target)
 * 2. App-as-a-Model (dynamic module load via ./path or @scope/pkg)
 * 3. Legacy CLI entry (nan0web.cli.entry or exports['./ui/cli'])
 *
 * @extends {ModelAsApp}
 */
export class App extends ModelAsApp {
	static UI = {
		title: 'NaN•Web CLI',
		icon: '🌐',
		description: 'Universal runner for OLMUI applications.',

		connecting: 'Connecting to Remote OLMUI Server at {url}...',
		sessionDone: 'Session finished.',
		moduleError: 'Module Resolution Error: Could not resolve {module}',
		usageExamples: [
			'{cmd} ./src/MyApp.js           — run a local Model-as-App',
			'{cmd} @nan0web/store           — run a workspace package',
			'{cmd} https://api.example.com  — connect to remote OLMUI',
			'{cmd} --blueprint              — scaffold a new project',
			'{cmd} --completion zsh        — generate shell completion',
		],
		noEntry:
			'No CLI entry point found.\nAdd "exports": { "./ui/cli": "./src/domain/App.js" } to package.json\nOR "nan0web.cli.entry" to package.json',
		noExport: 'Module at {path} must export default, App, or a class with run()',
		noModel:
			'Module at {path} (from exports or blueprint) must export default, App class, or a class with run()',
	}

	// ─── Schema Fields (Model-as-Schema) ──────────────────────────────────────

	static target = {
		type: 'string',
		help: 'Target path, URL, or package. E.g.: ./src/App.js | @nan0web/ui/inspect | https://app.example.com/run',
		positional: true,
		default: undefined,
	}

	static blueprint = {
		type: 'boolean',
		help: 'Bootstrap a new NaN•Web project interactively',
		default: false,
	}

	static debug = {
		type: 'boolean',
		help: 'Enable debug output',
		default: false,
		alias: 'd',
	}

	static test = {
		type: 'boolean',
		help: 'Exit with code 1 on error result (CI mode)',
		default: false,
	}

	static locale = {
		type: 'string',
		help: 'Override locale (e.g. uk, en)',
		default: undefined,
	}

	static cwd = {
		type: 'string',
		help: 'Working directory for DB resolution (defaults to process.cwd())',
		default: undefined,
	}

	static help = {
		type: 'boolean',
		help: 'Show help text',
		default: false,
	}

	static completion = {
		type: 'string',
		help: 'Generate shell completion script (zsh|bash)',
		default: undefined,
	}

	/**
	 * @param {Partial<App>} [data]
	 * @param {Partial<AppOptionsWithName>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string | undefined} Target path or URL */ this.target
		/** @type {boolean} Enable debug */ this.debug
		/** @type {boolean} CI test mode */ this.test
		/** @type {string | undefined} Locale override */ this.locale
		/** @type {string | undefined} Working directory override */ this.cwd
		/** @type {boolean} Blueprint mode */ this.blueprint
		/** @type {boolean} Help mode */ this.help
		/** @type {string | undefined} Completion script type */ this.completion
		/** @type {string[]} Remaining positionals for sub-model */ this._positionals
	}

	static aliases = {
		docs: './ReadmeMd.js',
		app: './App.js',
		config: '@nan0web/ui/src/domain/app/ConfigApp.js'
	}

	/**
	 * Generate help text with completion instructions.
	 * @returns {string} Help text
	 */
	generateHelp() {
		const baseHelp = super.generateHelp?.() || ''
		const t = this._.t || ((k) => k)
		/** @type {import('@nan0web/ui').ModelAsAppOptions & { appName?: string }} */
		const internal = this._
		const appName = internal.appName || 'nan0cli'
		
		// Return help as markdown string for OLMUI rendering
		return `🏗️ NaN•Web CLI Help

🌐 NaN•Web CLI
Universal runner for OLMUI applications.

## Usage:

\`\`\`bash
 [target] [options]
./src/MyApp.js            — run a local Model-as-App
@nan0web/store           — run a workspace package
https://api.example.com  — connect to remote OLMUI
--blueprint              — scaffold a new project
--completion zsh         — generate shell completion
\`\`\`

## Arguments:

\`\`\`bash
target   - Target path, URL, or package. E.g.: ./src/App.js | @nan0web/ui/inspect | https://app.example.com/run
\`\`\`

## Options:

\`\`\`bash
--blueprint    - Bootstrap a new NaN•Web project interactively [false]
--completion   - Generate shell completion script (zsh|bash)
--cwd          - Working directory for DB resolution (defaults to process.cwd())
-d, --debug        - Enable debug output [false]
--help         - Show help text
--locale       - Override locale (e.g. uk, en)
--raw          - Raw output (no UI decorations) [false]
--test         - Exit with code 1 on error result (CI mode) [false]
\`\`\`

💡 Shell Completion:
  ${appName} --completion zsh   # Generate zsh completion
  ${appName} --completion bash   # Generate bash completion
  source <(${appName} --completion zsh)  # Load in zsh
  source <(${appName} --completion bash)  # Load in bash`
	}

	/**
	 * Main execution generator.
	 * Routes to the correct execution mode based on parsed args.
	 *
	 * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run(options) {
		const t = this._.t || ((k) => k)

		// ── Help mode ─────────────────────────────────────────────────────────
		if (this.help) {
			// Use standard OLMUI help rendering via ask intent
			const content = this.generateHelp()
			yield ask('help', { content, title: 'NaN•Web CLI Help', hint: 'content-viewer' })
			return result({})
		}

		// ── Completion mode ──────────────────────────────────────────────────
		if (this.completion) {
			yield* this._handleCompletion()
			return result({})
		}

		// ── Blueprint mode ────────────────────────────────────────────────────
		if (this.blueprint) {
			yield* this._runModule(new URL('../blueprint/project.js', import.meta.url).pathname, [])
			return result({})
		}

		// ── Remote OLMUI thin client (HTTP/HTTPS) ─────────────────────────────
		const target = this.target
		if (target && /^https?:\/\//.test(target)) {
			yield* this._runRemote(target)
			return result({})
		}

		// ── Aliased built-ins ─────────────────────────────────────────────────
		if (target && App.aliases[target]) {
			yield* this._runModule(new URL(App.aliases[target], import.meta.url).pathname, this._positionals || [])
			return result({})
		}

		// ── Dynamic module loading (./, @scope) ───────────────────────────────
		if (target) {
			yield* this._runModule(target, this._positionals || [])
			return result({})
		}

		// ── Data-Driven App (.nan0) ───────────────────────────────────────────
		const db = this._.db
		if (db) {
			let currentPath = 'index'
			const pathStack = ['index']
			while (true) {
				const locale = (/** @type {any} */ (this._)).locale || 'en'
				let doc = await db.fetch(`${locale}/${currentPath}`)
				if (!doc) doc = await db.fetch(`en/${currentPath}`)
				if (!doc) doc = await db.fetch(currentPath)
				
				if (!doc) {
					yield show(t(App.UI.noModel, { path: currentPath }), 'error')
					if (currentPath === 'index') break
					currentPath = 'index'
					continue
				}

				// Optional: Breadcrumbs for sub-pages
				if (currentPath !== 'index') {
					const crumbs = ['Home']
					if (doc.title) crumbs.push(doc.title)
					else if (doc.nav?.title) crumbs.push(doc.nav.title)
					else crumbs.push(currentPath)

					yield { type: 'renderComponent', component: 'Breadcrumbs', props: { items: crumbs } }
				}

				// 1. Content Phase (Layout Engine)
				const layout = doc.$content || [{ Content: true }]
				if (Array.isArray(layout)) {
					for (const step of layout) {
						const type = Object.keys(step)[0]
						let props = step[type]

						if (props === true) props = {} // Expand simple flags

						if (type === 'Content') {
							// Render actual document content body
							if (doc.content && Array.isArray(doc.content)) {
								for (const contentStep of doc.content) {
									const cType = Object.keys(contentStep)[0]
									const cProps = contentStep[cType]
									yield { type: 'renderComponent', component: cType, props: cProps }
								}
							}
							continue
						}

						// Resolve variable bindings in layout props (e.g. title: '$title')
						if (typeof props === 'object' && props !== null) {
							props = { ...props }
							for (const [key, val] of Object.entries(props)) {
								if (typeof val === 'string' && val.startsWith('$')) {
									const propName = val.slice(1)
									const foundVal = Data.find(propName.split('.'), doc)
									if (foundVal !== undefined) {
										props[key] = foundVal
									}
								}
							}
						}

						yield { type: 'renderComponent', component: type, props }
					}
				}

				// 2. Navigation Phase (Optional)
				if (!doc.nav) break

				// Resolve global nav string
				if (typeof doc.nav === 'string') {
					let loadedNav = await db.fetch(`${locale}/${doc.nav}`)
					if (!loadedNav) loadedNav = await db.fetch(doc.nav)
					if (loadedNav) doc.nav = loadedNav
				}

				let navOptions = doc.nav.children || doc.nav.options || doc.nav
				if (Array.isArray(navOptions)) {
					navOptions = navOptions.map(opt => {
						if (typeof opt === 'string') return { label: opt, value: opt }
						return { label: opt.title || opt.label, value: opt.href || opt.action || opt.value }
					})
					// Auto-inject Language Switcher
					if (doc.langs && Array.isArray(doc.langs) && doc.langs.length > 1) {
						navOptions.push({ label: `🌐 ${doc.langs.title || t('Choose language')}`, value: '_lang_' })
					}

					// Auto-inject Back/Exit
					if (currentPath === 'index') {
						navOptions.unshift({ label: `🚪 ${t('Exit')}`, value: 'exit' })
					} else {
						navOptions.push({ label: `⬅ ${t('Back')}`, value: '_back_' })
					}

					doc.nav = { ...doc.nav, options: navOptions }
				}

				const answer = yield ask('nav', doc.nav)
				if (!answer || answer.cancelled || answer.value === 'exit') break

				if (answer.value === '_lang_') {
					const langOptions = doc.langs.map(l => ({ label: l.title || l.label, value: l.locale || l.value }))
					const langAnswer = yield ask('select', { title: doc.langs.title || t('Choose language'), options: langOptions })
					if (langAnswer && langAnswer.value) {
						(/** @type {any} */ (this._)).locale = langAnswer.value
					}
					continue // Reload current doc in new language
				}

				if (answer.value === '_back_') {
					pathStack.pop()
					currentPath = pathStack[pathStack.length - 1] || 'index'
					continue
				}

				if (answer.value !== currentPath && answer.value !== 'index') {
					pathStack.push(answer.value)
				} else if (answer.value === 'index') {
					pathStack.length = 0
					pathStack.push('index')
				}
				
				currentPath = answer.value
			}
			return result({})
		}

		// ── Auto-detect from package.json (Legacy fallback) ───────────────────
		yield* this._runFromPackage()
		return result({})
	}

	/**
	 * Run a remote OLMUI server in thin-client mode.
	 * @param {string} url
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *_runRemote(url) {
		const t = this._.t || ((k) => k)
		yield show(t(App.UI.connecting, { url }))

		let currentSessionId = null
		let answerToSend = undefined

		while (true) {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(
					currentSessionId ? { sessionId: currentSessionId, answer: answerToSend } : {}
				),
			})

			if (!res.ok) {
				/** @type {any} */
				const err = await res.json().catch(() => ({}))
				throw new Error(err.error || `HTTP ${res.status}`)
			}

			let response = {}
			try {
				response = /** @type {any} */ (await res.json())
			} catch {}
			const { sessionId, intent, done } = response
			currentSessionId = sessionId
			const currentIntent = intent.value || intent

			if (currentIntent?.type === 'progress') {
				yield progress(currentIntent.message || 'Progress...', currentIntent.percent ?? 0)
				answerToSend = undefined
				if (done) break
				continue
			}

			if (currentIntent?.type === 'result') {
				yield show(JSON.stringify(currentIntent.data || currentIntent, null, 2))
				answerToSend = undefined
				if (done) break
				continue
			}

			if (done) break

			// Ask intent: delegate to adapter level
			const adapterRes = yield currentIntent
			if (adapterRes && adapterRes.cancelled) break
			answerToSend = adapterRes
		}

		yield show(t(App.UI.sessionDone))
	}

	/**
	 * Resolve, import, and run a module by path or package specifier.
	 * @param {string} specifier Path or package name
	 * @param {string[]} argv Remaining argv for the sub-model
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *_runModule(specifier, argv) {
		const { pathToFileURL } = await import('node:url')
		const path = await import('node:path')

		const t = this._.t || ((k) => k)

		let resolvedPath = specifier
		if (specifier.startsWith('@') && !specifier.startsWith('@nan0web')) {
			// Non-workspace package
			const { createRequire } = await import('node:module')
			const req = createRequire(path.default.join(process.cwd(), 'package.json'))
			try {
				resolvedPath = req.resolve(specifier)
			} catch {
				yield show(t(App.UI.moduleError, { module: specifier }), 'error')
				return result({ success: false })
			}
		} else if (specifier.startsWith('@nan0web')) {
			const { createRequire } = await import('node:module')
			const req = createRequire(path.default.join(process.cwd(), 'package.json'))
			try {
				resolvedPath = req.resolve(specifier)
			} catch {
				yield show(t(App.UI.moduleError, { module: specifier }), 'error')
				return result({ success: false })
			}
		} else if (!path.default.isAbsolute(specifier)) {
			resolvedPath = path.default.resolve(process.cwd(), specifier)
		}

		const appThis = /** @type {any} */ (this)
		const mod = await (appThis._import ? appThis._import(String(pathToFileURL(resolvedPath))) : import(String(pathToFileURL(resolvedPath))))
		const AppModel =
			mod.default ||
			mod.App ||
			Object.values(mod).find((m) => typeof m === 'function' && m.prototype?.run)

		if (!AppModel) {
			yield show(t(App.UI.noModel, { path: resolvedPath }), 'error')
			return result({ success: false })
		}

		yield* this._runModel(AppModel, argv)
		return result({})
	}

	/**
	 * Handle shell completion generation.
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *_handleCompletion() {
		const CompletionGenerator = (await import('../ui/core/CompletionGenerator.js')).default
		/** @type {import('@nan0web/ui').ModelAsAppOptions & { appName?: string }} */
		const internal = this._
		const appName = internal.appName || 'nan0cli'
		
		// Extract command structure from this App class
		const commandStructure = CompletionGenerator.extractCommandStructure(this.constructor)
		
		// Generate completion script
		const shellType = this.completion === 'zsh' ? 'zsh' : 'bash'
		const completionScript = CompletionGenerator.generateCompletionScript(shellType, commandStructure, appName)
		
		// Output the completion script
		yield { type: 'output', content: completionScript }
	}

	/**
	 * Auto-detect entry from package.json and run it.
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *_runFromPackage() {
		const DBFS = (await import('@nan0web/db-fs')).default
		const { pathToFileURL } = await import('node:url')
		const t = this._.t || ((k) => k)
		const fs = new DBFS()
		const pkg = await fs.loadDocument('package.json', {})

		// Try exports['./ui/cli'] first
		const uiCliExport = pkg?.exports?.['./ui/cli']
		if (uiCliExport) {
			const exportPath =
				typeof uiCliExport === 'string' ? uiCliExport : uiCliExport.import || uiCliExport.default
			if (exportPath) {
				const absExport = fs.absolute(exportPath)
				const mod = await import(String(pathToFileURL(absExport)))
				const Resolved = mod.default || mod.App

				if (Resolved === App) {
					yield show(this.generateHelp())
					return result({})
				}

				yield* this._runModule(absExport, this._positionals || [])
				return result({})
			}
		}

		// Try legacy nan0web.cli.entry or known candidates
		const entry = pkg?.nan0web?.cli?.entry
		const candidates = [entry, 'src/cli.js', 'src/messages/index.js'].filter(Boolean)
		let appPath = null

		for (const candidate of candidates) {
			const stat = await fs.statDocument(candidate)
			if (!stat.error) {
				appPath = fs.absolute(candidate)
				break
			}
		}

		if (!appPath) {
			yield show(t(App.UI.noEntry), 'error')
			return result({ success: false })
		}

		const mod = await import(String(pathToFileURL(appPath)))
		const AppClass = mod.default || mod.Messages || mod.App
		if (!AppClass) {
			yield show(t(App.UI.noExport, { path: appPath }), 'error')
			return result({ success: false })
		}

		// Legacy CLI class support (non-generator)
		if (!AppClass.prototype?.run) {
			const Messages = Array.isArray(AppClass) ? AppClass : [AppClass]
			const { CLI } = await import('../index.js')
			const cli = new CLI({ Messages, argv: process.argv.slice(2) })
			for await (const output of cli.run()) {
				if (output?.content) {
					for (const line of output.content) yield show(line)
				}
			}
			return result({})
		}

		yield* this._runModel(AppClass, this._positionals || [])
	}

	/**
	 * Instantiate and run an AppModel generator, yielding all intents upstream.
	 * @param {typeof ModelAsApp} AppModel
	 * @param {string[]} argv Remaining positionals for the sub-model
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *_runModel(AppModel, argv) {
		const { modelFromArgv } = await import('../ui/core/modelFromArgv.js')

		const t = this._.t || ((k) => k)
		const db = this._.db
		const adapter = this._.adapter

		// Re-inject known flags that sub-models may accept (test, debug, locale)
		const extraFlags = []
		if (this.test) extraFlags.push('--test')
		if (this.debug) extraFlags.push('--debug')
		if (this.locale) extraFlags.push('--locale', this.locale)

		const fullArgv = [...argv, ...extraFlags]
		const subOptions = { db, t, locale: this.locale, adapter }
		const subModel = modelFromArgv(AppModel, fullArgv, subOptions)

		// Yield* so all sub-intents (show, progress, result) flow through to adapter
		const res = yield* subModel.run()

		if (this.test && (res?.data?.status === 'error' || res?.data?.success === false)) {
			process.exit(1)
		}
	}
}

export default App
