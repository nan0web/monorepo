import { ModelAsApp, show, ask, progress, result, log } from '@nan0web/ui'
import event from '@nan0web/event'
import { EditorConfig } from './EditorConfig.js'

/** @typedef { 'standalone' | 'authenticated' } EditorAccessMode */
/** @typedef { { isAuthenticated: boolean, user?: object, token?: string } } EditorSession */
/** @typedef {import('@nan0web/ui').ModelAsAppOptions & { stageDb?: import('@nan0web/db').DB }} EditorModelOptions */

import { ExplorerAction, SettingsAction, CommitAction, ExitAction } from './actions/index.js'

/**
 * EditorModel — Domain model for the editor app.
 *
 * Orchestrates the editor lifecycle and optionally integrates
 * with an authorization plugin for permission checking.
 */
export class EditorModel extends ModelAsApp {
	static UI = {
		actionsLabel: 'Editor actions: ',
		initializing: 'Initializing editor...',
		authSkipped: 'Auth module not available — running in standalone mode',
		authLoaded: 'Auth module loaded and session established',
		ready: 'Editor ready',
		permissionDenied: 'You do not have permission for this action',
	}

	static config = {
		help: 'Editor configuration (bundled, publicWrite, etc.)',
		type: EditorConfig,
		default: {},
	}

	static initialContent = {
		help: 'Starting content for the editor',
		type: 'object',
		default: {},
	}

	static session = {
		help: 'Current editor session',
		type: 'object',
		default: null,
	}

	static accessMode = {
		help: 'Access mode (standalone, authenticated, etc.)',
		type: 'string',
		default: 'standalone',
	}

	static permissions = {
		help: 'Editor permissions map',
		type: 'object',
		default: null,
	}

	static action = {
		help: 'Editor action to perform',
		type: 'Model',
		options: [ExplorerAction, SettingsAction, CommitAction, ExitAction],
		default: null,
	}

	static document = {
		help: 'Currently active document in the editor',
		type: 'object',
		default: null,
	}

	/**
	 * @param {Partial<EditorModel>} [data]
	 * @param {Partial<EditorModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {EditorConfig} Editor configuration */
		this.config = EditorConfig.from(this.config)
		/** @type {EditorSession|null} Current editor session */ this.session
		/** @type {EditorAccessMode} Access mode (standalone, authenticated, etc.) */ this.accessMode
		/** @type {import('./EditorPermissions.js').EditorPermissions} Editor permissions map */ this
			.permissions
		/** @type {object} Starting content for the editor */ this.initialContent
		/** @type {string|object|null} Editor action to perform */ this.action
		/** @type {object|null} Currently active document in the editor */ this.document

		const bus = event()
		this.on = bus.on.bind(bus)
		this.off = bus.off.bind(bus)
		this.emit = bus.emit.bind(bus)

		/** @type {import('@nan0web/db').DB} Local base for staging */
		this.stageDb = options.stageDb || this._.db || options.db
	}

	/**
	 * Attempt to load an authorization plugin from provided options or fallback to default.
	 * Checks for a strict "auth" contract: specific category or interface.
	 * @returns {Promise<object|null>}
	 */
	async #tryLoadAuth() {
		if (!this._.db) return null
		try {
			// Search for an auth plugin among provided options.plugins
			const plugins = this._.plugins || []
			const AuthPlugin = plugins.find((p) => {
				// 1. Explicit categorization check
				if (p.category === 'auth' || p.UI?.category === 'auth') return true
				
				// 2. Strict Interface Contract (must have a run method)
				const prototype = typeof p === 'function' ? p.prototype : Object.getPrototypeOf(p)
				const hasRun = prototype && typeof prototype.run === 'function'
				
				// If it has run() and mentions 'auth' in its identifier, it matches the contract
				return hasRun && (p.name || p.constructor?.name || '').toLowerCase().includes('auth')
			})

			if (AuthPlugin) {
				return typeof AuthPlugin === 'function' ? new AuthPlugin({ db: this._.db }) : AuthPlugin
			}

			// Fallback to standard @nan0web/auth.app if no plugin matches the contract
			const { default: AuthApp } = await import('@nan0web/auth.app')
			return new AuthApp({ db: this._.db })
		} catch {
			return null
		}
	}

	/**
	 * List directory entries merging results from the main DB and the local staging.
	 * @param {string} path 
	 * @returns {Promise<object[]>}
	 */
	async listDirectory(path = '.') {
		if (path === '') path = '.'
		const entries = new Map()
		if (this._.db) {
			for await (const entry of this._.db.findStream(path, { limit: -1 })) {
				entry.isStaged = false
				entries.set(entry.file.path, entry)
			}
		}
		// Also include entries from staging
		if (this.stageDb) {
			for await (const entry of this.stageDb.findStream(
				path === '.' ? '_staged' : `_staged/${path}`,
				{ limit: -1 },
			)) {
				if (entry.file.path.startsWith('_staged/')) {
					entry.file.path = entry.file.path.replace('_staged/', '')
				}
				entry.isStaged = true
				entries.set(entry.file.path, entry)
			}
		}
		return Array.from(entries.values())
	}

	/**
	 * Find all documents that reference the specified URI.
	 * @param {string} targetUri
	 * @returns {Promise<string[]>}
	 */
	async findReferences(targetUri) {
		const refs = []
		const cleanTarget = targetUri.replace(/\.nan0$/, '')
		if (!this._.db) return refs

		for await (const entry of this._.db.findStream('.', { limit: -1 })) {
			const doc = await this._.db.loadDocument(entry.file.path)
			const docStr = JSON.stringify(doc)
			// Look for direct references in the content
			if (
				docStr.includes(`"$ref":"${cleanTarget}"`) ||
				docStr.includes(`"$ref": "${cleanTarget}"`)
			) {
				refs.push(entry.file.path.replace(/\.nan0$/, ''))
			}
		}
		return refs
	}

	/**
	 * Fast search among a large number of documents (Mock).
	 * @param {string} query
	 * @returns {Promise<string[]>}
	 */
	async fastSearch(query) {
		// Mock logic for 1M+ search
		return ['result-1', 'result-2']
	}

	/**
	 * Resolving DSN (Data Source Name) for database connections.
	 * @param {string} dsn
	 * @returns {Promise<{ protocol: string, path: string }>}
	 */
	async resolveDSN(dsn) {
		const [protocol, ...rest] = dsn.split('://')
		return { protocol, path: rest.join('://') }
	}

	/**
	 * Load a document, merging main DB content with local staged changes.
	 * @param {string} path 
	 * @returns {Promise<object>}
	 */
	async loadDocument(path) {
		// 1. Fetch base document from main DB
		const base = await this._.db.loadDocument(path).catch(() => ({}))

		// 2. Search for uncommitted changes in Local Stage
		const staged = await this.stageDb.loadDocument(`_staged/${path}`).catch(() => null)

		// 3. If stage exists, merge (staged content has priority)
		if (staged) {
			return { ...base, ...staged }
		}

		return base
	}

	/**
	 * Opens a document for editing.
	 * Supports auto-extension detection (.nan0 or .md) and recursive redirects.
	 *
	 * @param {string} url - Path to the document (with or without extension).
	 */
	async *openDocument(url) {
		let path = url
		if (!path.endsWith('.nan0') && !path.endsWith('.md')) {
			try {
				await this._.db.get(path + '.nan0')
				path += '.nan0'
			} catch (e) {
				path += '.md'
			}
		}

		yield log('info', `Loading: ${path}...`)
		const doc = await this.loadDocument(path)

		if (doc?.$redirect) {
			yield log('info', `Found nested redirect to ${doc.$redirect}`)
			yield* this.openDocument(doc.$redirect)
			return
		}

		this.document = doc
		yield log('success', `Document ${path} loaded`)
		this.emit('document-change', doc)
	}

	// ==========================================
	// 2. Local Stage & Review Workflow
	// ==========================================
	
	/**
	 * Save uncommitted changes to the local stage.
	 * @param {string} path 
	 * @param {object} document 
	 * @param {object} [options] 
	 */
	async stageChange(path, document, options = {}) {
		const cleanPath = path.startsWith('_staged/') ? path.slice(8) : path

		// Conflict check (Scenario 3.2)
		if (options.baseHash) {
			const current = await this._.db.loadDocument(cleanPath).catch(() => ({}))
			const currentHash = JSON.stringify(current).length // Simplified hash for testing
			if (currentHash !== options.baseHash) {
				throw new Error('CONFLICT: Document has been modified externally')
			}
		}

		await this.stageDb.saveDocument(`_staged/${cleanPath}`, document)
	}

	/**
	 * Commit all staged changes to the main database.
	 * @param {string} message 
	 * @returns {Promise<{ success: boolean, message: string }>}
	 */
	async commitChanges(message) {
		const stagedFiles = []
		for await (const entry of this.stageDb.findStream('_staged/', { limit: -1 })) {
			stagedFiles.push(entry.file.path)
		}

		if (stagedFiles.length === 0) throw new Error('No changes to commit')

		// Move files from Stage to main DB-FS
		for (const stagePath of stagedFiles) {
			const doc = await this.stageDb.loadDocument(stagePath)
			const realPath = stagePath.replace('_staged/', '')

			// Save to main DB (which might route to Review Branch)
			await this._.db.saveDocument(realPath, doc)

			// Clear stage
			await this.stageDb.deleteDocument(stagePath).catch(() => {})
		}

		return { success: true, message: `Committed ${stagedFiles.length} files: ${message}` }
	}

	// ==========================================
	// 3. Main Editor Loop (OLMUI)
	// ==========================================
	
	/**
	 * Main application entry point as an async generator.
	 * Yields UI intents to the adapter.
	 */
	async *run() {
		const { t } = this._
		yield progress(t(EditorModel.UI.initializing))

		// 1. Bootstrap: Load root index
		try {
			const root = await this._.db.get('index.nan0')
			if (root?.$redirect) {
				yield log('info', `Redirecting to ${root.$redirect}...`)
				yield* this.openDocument(root.$redirect)
			}
		} catch (e) {
			yield log('warn', 'Root index.nan0 not found, starting empty')
		}

		// 2. Load global configuration
		try {
			const globalConfig = await this._.db.get('_.nan0')
			if (globalConfig) {
				this.config = EditorConfig.from({ ...this.config, ...globalConfig.ui })
			}
		} catch (e) {}

		// 3. Initialize authentication
		if (!this.session) {
			const auth = await this.#tryLoadAuth()
			if (auth) {
				yield log('info', t(EditorModel.UI.authLoaded))
				const authResult = yield* auth.run()
				this.session = authResult?.session || { isAuthenticated: false }
			} else {
				yield log('info', t(EditorModel.UI.authSkipped))
				this.session = { isAuthenticated: false }
			}
		}

		this.accessMode = this.config.resolveAccessMode({
			hasAuth: this.session?.isAuthenticated,
		})
		this.permissions = this.config.resolvePermissions(this.session)

		if (this.accessMode === 'authenticated' && !this.permissions.canEdit) {
			yield log('error', t(EditorModel.UI.permissionDenied))
			return {
				status: 'error',
				reason: 'permission_denied',
				permissions: this.permissions,
				mode: this.accessMode,
			}
		}

		yield log('success', t(EditorModel.UI.ready))

		// Main interaction loop — Editor as a sequence of blocks
		while (true) {
			const files = await this.listDirectory()

			// 1. Show tree navigation
			yield show('navigation', {
				component: 'tree-navigator',
				items: files,
				config: this.config,
			})

			// 2. If a document is active — show the editor form
			if (this.document) {
				yield show('editor', {
					component: 'schema-form',
					model: this.document,
					config: this.config,
				})
			}

			// 3. Ask for the next action
			const res = yield ask(t(EditorModel.UI.actionsLabel), {
				field: 'action',
				model: true,
				options: [ExplorerAction, SettingsAction, CommitAction, ExitAction],
			})

			const currentAction = res?.value ?? res
			if (!currentAction || currentAction === 'exit') break

			// Action processing (e.g. opening a file via ExplorerAction)
			if (typeof currentAction.run === 'function') {
				yield* currentAction.run({ editor: this })
			}
		}

		return {
			status: 'ok',
			data: {
				session: this.session,
				permissions: this.permissions,
				mode: this.accessMode,
				config: this.config,
				initialContent: this.initialContent,
			},
		}
	}
}
