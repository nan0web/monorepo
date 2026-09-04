import { NoConsole } from '@nan0web/log'
import FormatRegistry from '../../FormatRegistry.js'
import DocumentStat from '../../DocumentStat.js'
import DocumentEntry from '../../DocumentEntry.js'
import DirectoryIndex from '../../DirectoryIndex.js'
import DBDriverProtocol from '../DriverProtocol.js'
import AuthContext from '../AuthContext.js'
import {
	absolute,
	basename,
	dirname,
	extname,
	isAbsolute,
	isRemote,
	normalize,
	relative,
	resolveSync,
} from '../path.js'

/**
 * TTL-aware Map that automatically expires entries after a given time.
 * @extends {Map}
 */
class TTLMap extends Map {
	/**
	 * @param {number} ttl - Cache life time in milliseconds.
	 * @param {Iterable<[any, any]>} [entries] - Initial entries.
	 */
	constructor(ttl, entries) {
		super()
		this.ttl = ttl
		if (entries) {
			for (const [k, v] of entries) {
				this.set(k, v)
			}
		}
	}
	/**
	 * @param {any} key
	 * @param {any} value
	 */
	set(key, value) {
		super.set(key, { value, expires: this.ttl ? Date.now() + this.ttl : 0 })
		return this
	}
	/**
	 * @param {any} key
	 * @returns {any}
	 */
	get(key) {
		const entry = super.get(key)
		if (undefined === entry) {
			return undefined
		}
		if (Date.now() > entry.expires) {
			super.delete(key)
			return undefined
		}
		return entry.value
	}
}

/**
 * Base database class providing core infrastructure for document storage and retrieval.
 * Handles configuration, events, mounting, path resolution, and directory operations.
 * Serves as the foundation layer in the layered inheritance chain.
 *
 * Key features:
 * - URI-based path resolution and normalization
 * - Caching via in-memory Maps for data and metadata
 * - Event system with on/emit/watch/unwatch
 * - Mount/unmount support for federated databases
 * - Directory traversal with indexing support
 *
 * @abstract
 * @class
 */
export default class DBBase {
	/**
	 * Duck-typing check for DB instances.
	 * Works across package boundaries where instanceof may fail
	 * due to duplicate module copies (npm + workspace:*).
	 * @param {any} obj
	 * @returns {boolean}
	 */
	static isDB(obj) {
		return Boolean(
			obj &&
			typeof obj.fetch === 'function' &&
			typeof obj.set === 'function' &&
			typeof obj.stat === 'function'
		)
	}

	/**
	 * Creates a new DB instance from input object.
	 * Supports DB instances, plain objects with constructor options, or undefined.
	 * @param {object | any} [input] - Input object or DB instance
	 * @returns {any} New DB instance
	 */
	static from(input) {
		if (!input) return new this()
		if (input instanceof this) return input
		return new this(input)
	}

	/** @type {FormatRegistry} */
	registry
	/** @type {DBDriverProtocol} */
	driver
	/** @type {string} */
	encoding = 'utf-8'
	/** @type {Map<string, any | false>} */
	data = new Map()
	/** @type {Map<string, DocumentStat>} */
	meta = new Map()
	/** @type {number} */
	ttl = 0
	/** @type {AuthContext} */
	context = new AuthContext()
	/** @type {boolean} */
	connected = false
	/** @type {boolean} Mount registry sealed status */
	#sealed = false
	/** @type {string} */
	root = '.'
	/** @type {string} */
	cwd = '.'
	/** @type {DB[]} */
	dbs = []
	/** @type {Map<string, DB>} Sorted by prefix length descending for longest-match routing */
	mounts = new Map()
	/** @type {Map<string, Function>} URI-prefix → Model class for hydration */
	models = new Map()
	/** @type {Map} */
	predefined = new Map()
	/** @type {Record<string, string>} URI aliases for virtual projection */
	aliases = {}
	/** @type {Console | NoConsole} */
	#console
	/** @type {Map<string, Function[]>} */
	#listeners = new Map()
	/** @type {Map<string, any>} */
	_inheritanceCache = new Map()
	/** @type {Map<string, DocumentEntry[]>} Directory entry cache for listDir/getGlobals */
	_dirCache = new Map()

	/**
	 * Creates a new DB instance from input object
	 * that can include configuration for:
	 * - root directory,
	 * - working directory,
	 * - data and metadata maps,
	 * - connection status,
	 * - attached databases,
	 * - console for the debug, silent = true by default.
	 * - auth context for access control.
	 *
	 * @param {object} input
	 * @param {string} [input.cwd="."] - Current working directory (base for absolute paths)
	 * @param {string} [input.root="."] - Root path for URI resolution
	 * @param {DBDriverProtocol} [input.driver=new DBDriverProtocol()] - Access control driver
	 * @param {boolean} [input.connected=false] - Connection status
	 * @param {Map<string, any | false>} [input.data=new Map()] - In-memory data cache
	 * @param {Map<string, DocumentStat>} [input.meta=new Map()] - Metadata cache
	 * @param {number} [input.ttl=0] - Cache life time.
	 * @param {AuthContext | object} [input.context=new AuthContext()] - Authentication/authorization context
	 * @param {Map<string, any> | Array<readonly [string, any]>} [input.predefined=new Map()] - Data for memory operations.
	 * @param {DB[]} [input.dbs=[]] - Attached sub-databases
	 * @param {Function | Map<string, Function>} [input.models] - Model class(es) for hydration
	 * @param {Function} [input.Model] - Shorthand: single Model class for all URIs
	 * @param {Record<string, string>} [input.aliases={}] - URI aliases for virtual projection
	 * @param {Console | NoConsole} [input.console=new NoConsole()] - Logging console
	 * @param {FormatRegistry} [input.registry] - Format registry instance
	 * @param {Array<{ext: string, load: (str: string, ext: string) => any, save: (doc: any, ext: string) => string}>} [input.formats] - Custom format registrations
	 */
	constructor(input = {}) {
		const {
			cwd = this.cwd,
			root = this.root,
			driver,
			data = this.data,
			meta = this.meta,
			context = this.context,
			connected = this.connected,
			dbs = this.dbs,
			predefined = this.predefined,
			ttl = this.ttl,
			aliases = this.aliases,
			models,
			Model,
			console: consoleInput = new NoConsole({ silent: true }),
			formats,
			registry,
		} = input
		this.root = root
		this.cwd = cwd
		this.registry = registry || new FormatRegistry()
		if (Array.isArray(formats)) {
			for (const f of formats) {
				this.registry.register(f.ext, f.load, f.save)
			}
		}
		this.driver = this.Driver.from(driver ?? { cwd, root, registry: this.registry })
		if (this.driver && !this.driver.registry) {
			this.driver.registry = this.registry
		}
		this.ttl = Number(ttl || 0)
		this.data = data instanceof Map ? data : new TTLMap(this.ttl, data)
		this.meta = meta instanceof Map ? meta : new TTLMap(this.ttl, meta)
		this.context = AuthContext.from(context)
		this.#console = consoleInput
		this.connected = connected
		// Ensure that we have DB instances in the array
		// For the base it is always [], so it is safe to reassign
		// But for sub databases it must be initialized to array of DBs
		// So to always have DBs under this constructor
		// This is the part of the structure to support multiple DBs connected to the same base
		// See fetchDB for details, it is base DB for remote access over fetch
		// And DB is base local storage interface
		// Then attach another DB instances, that will be initialized with the root
		this.dbs = dbs.map((from) => /** @type {typeof DBBase} */ (this.constructor).from(from))
		this.predefined = predefined instanceof Map ? predefined : new Map(predefined)
		this.aliases = aliases
		// Model hydration: normalize to Map<prefix, ModelClass>
		if (models instanceof Map) this.models = models
		else if (typeof models === 'function') this.models = new Map([['/', models]])
		else if (typeof Model === 'function') this.models = new Map([['/', Model]])
		this.console.info('DB instance created', String(this))
	}

	/**
	 * Resolves a URI alias. If the URI matches a registered alias,
	 * returns the real target URI. Otherwise returns the original URI unchanged.
	 * Used for virtual projection of files (e.g., docs/en/README.md → ./README.md).
	 * @param {string} uri - The URI to resolve
	 * @returns {string} The resolved URI (alias target or original)
	 */
	resolveAlias(uri) {
		return this.aliases[uri] ?? uri
	}

	get Driver() {
		return /** @type {typeof DBBase} */ (this.constructor).Driver || DBDriverProtocol
	}

	/**
	 * Returns whether the database directory has been loaded
	 * @returns {boolean}
	 * Returns state of ?loaded marker in meta Map
	 * After .connect() and .readDir() the marker is placed as {mtime: true}
	 * Because we can load only once when depth=0, and every subsequent .readBranch() is depth>0
	 * and works with fully loaded DocumentEntry or DocumentStat data
	 */
	get loaded() {
		return this.meta.has('?loaded')
	}

	/**
	 * Fetches the index document for a directory.
	 * Returns empty object if index does not exist or Directory configuration is missing.
	 * @param {string} [dir=''] - The directory path
	 * @returns {Promise<Record<string, any>>}
	 */
	async fetchIndex(dir = '') {
		const Class = /** @type {typeof DBBase} */ (this.constructor)
		const Directory = Class.Directory
		if (!Directory || !Directory.INDEX) return {}
		const primaryIndex = Array.isArray(Directory.INDEX) ? Directory.INDEX[0] : Directory.INDEX
		const indexPath = dir ? this.resolveSync(dir, primaryIndex) : primaryIndex
		return (await this.fetch(indexPath)) ?? {}
	}

	/**
	 * Returns constructor options to save and restore database instance later.
	 * @returns {Record<string, any>}
	 */
	get options() {
		return {
			cwd: this.cwd,
			root: this.root,
		}
	}

	/** @returns {Console | NoConsole} */
	get console() {
		return this.#console
	}

	/**
	 * Subscribes to an event (e.g. 'fallback').
	 * @param {string} event
	 * @param {Function} fn
	 * @returns {void}
	 */
	on(event, fn) {
		const list = this.#listeners.get(event) || []
		list.push(fn)
		this.#listeners.set(event, list)
	}

	/**
	 * Emits an event to all registered listeners.
	 * @param {string} event
	 * @param {any} data
	 * @returns {void}
	 */
	emit(event, data) {
		const list = this.#listeners.get(event) || []
		for (const fn of list) fn(data)
	}

	/**
	 * Watches a URI for changes. Callback receives change events for
	 * the given URI or any URI under it (prefix match).
	 * @param {string} uri - URI or prefix to watch
	 * @param {Function} callback - Called with { uri, type, data }
	 * @returns {Function} Unsubscribe function
	 */
	watch(uri, callback) {
		const prefix = this.normalize(uri)
		const handler = (event) => {
			const normalized = this.normalize(event.uri)
			if (normalized === prefix || normalized.startsWith(prefix + '/') || prefix === '.') {
				callback(event)
			}
		}
		// Store reference for unwatch()
		if (!this._watchers) this._watchers = new Map()
		if (!this._watchers.has(prefix)) this._watchers.set(prefix, [])
		this._watchers.get(prefix).push({ callback, handler })
		this.on('change', handler)

		// Return unsubscribe function
		return () => this.unwatch(uri, callback)
	}

	/**
	 * Stops watching a URI. If callback is provided, removes only that
	 * specific watcher. Otherwise removes all watchers for the URI.
	 * @param {string} uri - URI to unwatch
	 * @param {Function} [callback] - Specific callback to remove
	 */
	unwatch(uri, callback) {
		if (!this._watchers) return
		const prefix = this.normalize(uri)
		const watchers = this._watchers.get(prefix)
		if (!watchers) return

		const listeners = this.#listeners.get('change') || []

		if (callback) {
			const idx = watchers.findIndex((w) => w.callback === callback)
			if (idx >= 0) {
				const [removed] = watchers.splice(idx, 1)
				const li = listeners.indexOf(removed.handler)
				if (li >= 0) listeners.splice(li, 1)
			}
		} else {
			for (const w of watchers) {
				const li = listeners.indexOf(w.handler)
				if (li >= 0) listeners.splice(li, 1)
			}
			this._watchers.delete(prefix)
		}
	}

	/**
	 * Registers a Model class for a URI prefix.
	 * When fetch() returns data, it will be hydrated through the Model.
	 * @param {string} prefix - URI prefix (e.g. 'users', 'config')
	 * @param {Function} ModelClass - Class with `from(data)` or constructor(data)
	 */
	model(prefix, ModelClass) {
		const normalized = this.normalize(prefix).replace(/\/$/, '') || '/'
		this.models.set(normalized, ModelClass)
		this.models = new Map([...this.models.entries()].sort((a, b) => b[0].length - a[0].length))
	}

	/**
	 * Returns Data helper class that is assigned to DB or its extension.
	 * Define your own Data provider to extend its logic, no need to extend getter.
	 * ```js
	 * class DataExtended extends DB {
	 *   static OBJECT_DIVIDER = "."
	 * }
	 * class DBExtended extends DB {
	 *   static Data = DataExtended
	 * }
	 * ```
	 * @returns {typeof Data}
	 */
	get Data() {
		return /** @type {typeof DBBase} */ (this.constructor).Data
	}
	/**
	 * Returns static.Directory that is assigned to DB or its extension.
	 * Define your own static.Directory, no need to extend getter.
	 * ```js
	 * class DirectoryExtended extends Directory {
	 *   static FILE = "$"
	 *   static DATA_EXTNAMES = [".md", ".csv"]
	 * }
	 * class DBExtended extends DB {
	 *   static Directory = DirectoryExtended
	 * }
	 * ```
	 * @returns {typeof Directory}
	 */
	get Directory() {
		return /** @type {typeof DBBase} */ (this.constructor).Directory
	}
	/**
	 * Returns static.Driver that is assigned to DBDriverProtocol or its extension
	 * @returns {typeof DBDriverProtocol}
	 */
	get Driver() {
		return /** @type {typeof DBBase} */ (this.constructor).Driver
	}
	/**
	 * @returns {typeof DirectoryIndex}
	 */
	get Index() {
		return /** @type {typeof DBBase} */ (this.constructor).Index
	}
	/**
	 * Returns static.GetOptions that is assigned to DB or its extension.
	 * Define your own static.GetOptions, no need to extend getter.
	 * ```js
	 * class GetOptionsExtended extends GetOptions {
	 *   defaultValue = ""
	 * }
	 * class DBExtended extends DB {
	 *   static GetOptions = GetOptionsExtended
	 * }
	 * ```
	 * @returns {typeof GetOptions}
	 */
	get GetOptions() {
		return /** @type {typeof DBBase} */ (this.constructor).GetOptions
	}

	/**
	 * @param {string} abs
	 * @returns {DocumentStat}
	 */
	_statFromMeta(abs) {
		const isFile = undefined !== this.data.get(abs)
		const mtimeMs = isFile ? Date.now() : 0
		return DocumentStat.from(this.meta.get(abs) ?? { isFile, mtimeMs })
	}

	isRoot(dir) {
		return ['/', '.', './', ''].includes(dir)
	}

	/**
	 * Resolves the actual underlying URI for a path.
	 * In the base abstract DB, this simply normalizes the URI.
	 * Adapters like db-fs override this to resolve symlinks and firmlinks.
	 * @param {string} uri The URI to resolve
	 * @returns {string} The resolved real URI
	 */
	realpath(uri) {
		return this.normalize(uri)
	}

	/**
	 * Returns a public website or application route path for a data document.
	 * Resolves document URIs to clean web routes relative to the database cwd:
	 * - Root index ('index.md', 'index.yaml', '') resolves to '/'
	 * - Directory index ('en/docs/index.md', 'en/docs/') resolves to '/en/docs/'
	 * - Regular documents ('en/docs/architecture.yaml') resolve to '/en/docs/architecture'
	 * - Supports appending a target output extension, e.g. ext='html' or '.html'
	 * - Returns FALSE for directory configs ('_.yaml', '_.nan0'), globals ('_/analytics.yaml', '_/t.yaml'),
	 *   or files that are not valid data documents (not in Directory.DATA_EXTNAMES).
	 *
	 * @param {string} uri Document URI or path
	 * @param {string} [ext] Target route extension to add (e.g. 'html' or '.html')
	 * @returns {string | false} Clean web route path or false if not a routable document
	 */
	route(uri, ext = '') {
		const DirectoryClass = /** @type {typeof DBBase} */ (this.constructor).Directory
		const normalized = this.normalize(uri)

		// 1. Check if it's a global variable path (_/...) or directory config (_)
		if (DirectoryClass.isGlobal(normalized) || DirectoryClass.isConfig(normalized)) {
			return false
		}

		// 2. Check if the file has an unsupported extension (not in DATA_EXTNAMES)
		const fileExt = this.extname(normalized)
		if (fileExt && !DirectoryClass.DATA_EXTNAMES.includes(fileExt)) {
			return false
		}

		const isDir = normalized.endsWith('/') || normalized === '' || normalized === '.'
		const primaryIndex = Array.isArray(DirectoryClass.INDEX) ? DirectoryClass.INDEX[0] : DirectoryClass.INDEX

		let targetExt = ext ? (ext.startsWith('.') ? ext : '.' + ext) : ''

		if (isDir) {
			if (targetExt) {
				const dirPrefix = normalized && normalized !== '.' && normalized !== '/' ? normalized : ''
				return '/' + (dirPrefix ? dirPrefix + primaryIndex : primaryIndex) + targetExt
			}
			return normalized === '' || normalized === '.' ? '/' : '/' + normalized
		}

		const base = this.basename(normalized, true)
		const dir = this.dirname(normalized)
		const isIndex = typeof DirectoryClass.isIndex === 'function'
			? DirectoryClass.isIndex(base)
			: (Array.isArray(DirectoryClass.INDEX) ? DirectoryClass.INDEX.includes(base) : base === DirectoryClass.INDEX)

		if (targetExt) {
			const dirPrefix = dir && dir !== '.' ? dir : ''
			return '/' + (dirPrefix ? dirPrefix + base : base) + targetExt
		}

		if (isIndex) {
			return dir && dir !== '.' ? '/' + dir : '/'
		}

		const dirPrefix = dir && dir !== '.' ? dir : ''
		return '/' + (dirPrefix ? dirPrefix + base : base)
	}

	/**
	 * Returns a list of mounted database instances.
	 * @returns {Array<{ prefix: string, db: DB }>} Array of mount records
	 */
	getMounts() {
		return Array.from(this.mounts.entries()).map(([prefix, db]) => ({ prefix, db }))
	}

	/**
	 * Returns a mounted database instance by prefix.
	 * @param {string} prefix The path prefix to find the mounted database for
	 * @returns {DB | undefined} The mounted database instance or undefined if not found
	 */
	getMount(prefix) {
		return this.getMounts().find((m) => m.prefix === prefix)?.db
	}

	/**
	 * Returns available system volumes/disks as URIs.
	 * Overridden by adapters that support physical drives.
	 * @returns {Promise<string[]>} Array of volume URIs (e.g., ['/'])
	 */
	async getVolumes() {
		return ['/']
	}
	/**
	 * Mounts a database instance to a path prefix.
	 * All requests to URIs starting with this prefix will be routed to the mounted DB.
	 * @param {string} path - The virtual path prefix (e.g. '~', '@public')
	 * @param {DB} db - The database instance to mount
	 * @throws {TypeError} If non-DB instance is provided
	 * @throws {Error} If mount registry has been sealed
	 */
	mount(path, db) {
		if (this.#sealed) {
			throw new Error(`Mount registry is sealed. Cannot mount '${path}' after seal().`)
		}
		if (!/** @type {typeof DBBase} */ (this.constructor).isDB(db)) {
			throw new TypeError('Mounted instance must be a DB')
		}
		const normalized = this.normalize(path).replace(/\/$/, '')
		this.mounts.set(normalized, db)
		this.console.info(`Mounted DB at ${normalized} (root: ${db.root})`)
		// Sort mounts by length descending to match most specific prefix first
		this.mounts = new Map([...this.mounts.entries()].sort((a, b) => b[0].length - a[0].length))
	}

	/**
	 * Unmounts a database from a path.
	 * @param {string} path
	 * @returns {boolean} TRUE if mount existed and was removed
	 * @throws {Error} If mount registry has been sealed
	 */
	unmount(path) {
		if (this.#sealed) {
			throw new Error(`Mount registry is sealed. Cannot unmount '${path}' after seal().`)
		}
		const normalized = this.normalize(path).replace(/\/$/, '')
		return this.mounts.delete(normalized)
	}

	/**
	 * Seals the mount registry, preventing any further mount/unmount operations.
	 * Call after all databases are mounted during initialization.
	 * This prevents plugin or untrusted code from hijacking mount points.
	 * @returns {void}
	 */
	seal() {
		this.#sealed = true
		this.console.info('Mount registry sealed')
	}

	/**
	 * Returns whether the mount registry is sealed.
	 * @returns {boolean}
	 */
	get sealed() {
		return this.#sealed
	}

	/**
	 * Finds the mounted DB for a given URI.
	 * Uses longest-prefix matching (most specific mount wins).
	 * Throws a clear error if URI targets a reserved mount prefix
	 * (tilde or at-sign) that has not been mounted — prevents silent null returns.
	 * @param {string} uri
	 * @returns {{ db: DB, subUri: string } | null}
	 * @throws {Error} If URI targets an unmounted reserved prefix
	 */
	_findMount(uri) {
		const normalized = this.normalize(uri)
		for (const [prefix, db] of this.mounts) {
			if (prefix === '' || normalized === prefix || normalized.startsWith(prefix + '/')) {
				const subUri = normalized.slice(prefix.length) || '/'
				return { db, subUri: subUri.startsWith('/') ? subUri : '/' + subUri }
			}
		}
		// Throw clear error for reserved prefixes that were not mounted
		if (normalized.startsWith('~') || normalized.startsWith('@')) {
			const prefix = normalized.split('/')[0]
			throw new Error(
				`Mount point "${prefix}" not found for URI "${uri}". ` +
					`Did you forget to call db.mount('${prefix}', targetDb)?`
			)
		}
		return null
	}

	/**
	 * Attaches another DB instance to this database for fallback access.
	 * When primary fetch fails, attached databases are tried in order.
	 * @param {DB} db - Database to attach
	 * @returns {void}
	 * @throws {TypeError} If non-DB instance is provided
	 */
	attach(db) {
		if (!/** @type {typeof DBBase} */ (this.constructor).isDB(db)) {
			this.console.error('Attempted to attach a non-DB instance')
			throw new TypeError('It is possible to attach only DB or extended databases')
		}
		this.dbs.push(db)
		this.console.info(`Database attached: ${db}`)
	}

	/**
	 * Detaches a database instance from this database.
	 * @param {DB} db - Database to detach
	 * @returns {DB[]|boolean} Array of detached database or false if not found
	 */
	detach(db) {
		const index = this.dbs.findIndex((d) => d.root === db.root && d.cwd === db.cwd)
		if (index < 0) {
			this.console.warn(`Database not found for detachment: ${db}`)
			return false
		}
		const detached = this.dbs.splice(index, 1)
		this.console.info(`Database detached: ${db}`)
		return detached
	}

	/**
	 * Creates a new DB instance with a subset of the data and meta,
	 * scoped to a specific URI prefix.
	 *
	 * The returned database works as if the supplied `uri` were its
	 * virtual root:
	 *   - `root` property reflects the new virtual root (`.../uri/`).
	 *   - `cwd` is inherited from the parent so that `absolute()` still
	 *     produces full URLs.
	 *   - `resolveSync()` is overridden to return paths **relative** to the
	 *     extracted root (i.e. the prefix is stripped).
	 *
	 * @param {string} uri The URI to extract from the current DB.
	 * @returns {DB} New DB instance with filtered data and metadata.
	 */
	extract(uri) {
		this.console.debug('extract()', uri)

		const prefix = (this.normalize(uri) + '/').replace(/\/{2,}$/, '/')

		const Class = /** @type {typeof DBBase} */ (this.constructor)

		const extractor = (entries) =>
			new Map(
				Array.from(entries)
					.filter(([key]) => key.startsWith(prefix))
					.map(([key, value]) => [String(key.substring(prefix.length) || '.'), value])
			)

		let cwd = this.absolute(uri)

		const data = extractor(this.data.entries())
		const meta = extractor(this.meta.entries())

		const db = new Class({
			cwd,
			data,
			meta,
			console: this.console,
		})

		this.console.debug('extract().done', uri, { db })
		return db
	}

	/**
	 * Extracts file extension with leading dot from URI
	 * @param {string} uri
	 * @returns {string} Extension (e.g., ".txt") or empty string
	 * @example
	 * db.extname("file.TXT") // => .txt
	 */
	extname(uri) {
		return extname(uri)
	}

	/**
	 * Relative path resolver for file systems.
	 * Returns path relative to database root.
	 * @param {string} to Target directory path
	 * @param {string} [from=this.root] Base directory path
	 * @returns {string} Relative path
	 */
	relative(to, from = this.root) {
		const base = from.endsWith('/') ? from : from + '/'
		return relative(base, to)
	}

	/**
	 * Get string representation of the database
	 * @returns {string} Formatted string like "DB /root [utf-8]"
	 */
	toString() {
		return this.constructor.name + ' ' + this.cwd + '#' + this.root + ' [' + this.encoding + ']'
	}

	/**
	 * Dumps current database into destination database.
	 * Copies all documents and builds indexes in the destination.
	 * @param {DB} dest - Destination database
	 * @param {object} [options]
	 * @param {({ uri, url, data, current, total }) => void} [options.onProgress] - Progress callback
	 * @returns {Promise<{ total: number, processed: number, ignored: number, updatedURIs: string[] }>}
	 */
	async dump(dest, options = {}) {
		const { onProgress = () => {} } = options
		const total = this.meta.size
		let current = 0
		const updatedURIs = []
		for (const [uri, stat] of this.meta.entries()) {
			if (!stat.isFile) continue
			const data = await this.loadDocument(uri)
			current++
			try {
				let ext = this.extname(uri)
				if (this.isData(uri) && !dest.isData(uri)) {
					ext = dest.Directory.DATA_EXTNAMES[0] ?? '.json'
				}
				const url = this.resolveSync(this.dirname(uri), this.basename(uri, true) + ext)
				await dest.saveDocument(url, data)
				updatedURIs.push(url)
				onProgress({ uri, url, data, current, total })
				this.console.info(`Document dumped [${uri}]`, { data })
			} catch (/** @type {any} */ error) {
				this.console.error(`Failed to dump document [${uri}]`, { error: error.message })
			}
		}
		return {
			total,
			processed: updatedURIs.length,
			ignored: total - updatedURIs.length,
			updatedURIs,
		}
	}

	/**
	 * Build indexes inside the directory.
	 * Generates `index.txt` and `index.txtl` files for efficient traversal.
	 * @param {string} dir - Directory URI (default: '.')
	 * @returns {Promise<void>}
	 */
	async buildIndexes(dir = '.') {
		const stream = this.Index.generateAllIndexes(/** @type {any} */ (this), dir)
		for await (const [uri, index] of stream) {
			if (this.Index.isFullIndex(uri)) {
				await this.saveDocument(uri, index.encode({ long: true, inc: true }))
			} else {
				await this.saveDocument(uri, index.encode())
			}
		}
	}

	/**
	 *
	 * @param {string} dirPath The directory path.
	 * @param {Array<[string, DocumentStat]>} [entries=[]] Entries to extend with the files found.
	 * @param {number} [depth=0] The depth level.
	 * @returns
	 */
	async _buildRecursiveDirectoryTree(dirPath, entries = [], depth = 0) {
		const immediateEntries = await DirectoryIndex.getDirectoryEntries(
			/** @type {any} */ (this),
			dirPath
		)

		for (const [name, stat] of immediateEntries) {
			const fullPath = dirPath === '.' ? name : this.resolveSync(dirPath, name)
			const entryStat = {
				...stat,
				depth,
				name: fullPath,
			}

			entries.push([fullPath, new DocumentStat(entryStat)])

			if (name.endsWith('/') && name !== '.') {
				await this._buildRecursiveDirectoryTree(fullPath, entries, depth + 1)
			}
		}

		return entries
	}

	/**
	 * Reads the content of a directory at the specified URI.
	 * For FetchDB it loads index.txt or manifest.json.
	 * For NodeFsDB it uses readdirSync recursively.
	 *
	 * Supports filtering, depth limiting, and skipping stats/indexes for performance.
	 *
	 * @async
	 * @generator
	 * @param {string} uri - The URI of the directory to read
	 * @param {object} [options] - Read directory options
	 * @param {AuthContext | object} [options.context] - Auth context
	 * @param {number} [options.depth=-1] - The depth to which subdirectories should be read (-1 means unlimited)
	 * @param {boolean} [options.skipStat=false] - Whether to skip collecting file statistics
	 * @param {boolean} [options.includeDirs=false] - Whether to skip or include directories.
	 * @param {boolean} [options.skipSymbolicLink=false] - Whether to skip symbolic links
	 * @param {boolean} [options.skipIndex=false] - Skip index files
	 * @param {(string|RegExp)[]} [options.ignore=[]] - Patterns to ignore
	 * @param {Function} [options.filter] - A filter function to apply to directory entries
	 * @yields {DocumentEntry}
	 * @returns {AsyncGenerator<DocumentEntry, void, unknown>}
	 */
	async *readDir(uri, options = {}) {
		const {
			skipStat = false,
			skipSymbolicLink = false,
			skipIndex = false,
			includeDirs = false,
			filter,
			ignore = [],
			depth = -1,
			context,
		} = options

		this.console.debug('readDir()', uri, { uri, options })

		const authContext = AuthContext.from(context || this.context)
		await this.ensureAccess(uri, 'r', authContext)

		if (!skipIndex) {
			const indexPath = this.resolveSync(this.Index.FULL_INDEX)
			if (depth < 0) {
				const entries = await this.loadDocument(indexPath)
				if (entries) {
					const index = DirectoryIndex.decode(entries)
					for (const [path, stat] of index.entries) {
						const entry = new DocumentEntry({ path, stat })
						if (!filter || filter(entry)) {
							yield entry
						}
					}
					return
				}
			}
			const indexTxtPath = this.resolveSync(uri, this.Index.INDEX)
			const entries = await this.loadDocument(indexTxtPath, undefined, authContext)
			if (entries) {
				const index = DirectoryIndex.decode(entries)
				for (const [name, stat] of index.entries) {
					const path = this.resolveSync(uri, name)
					const entry = new DocumentEntry({ path, name: name, stat: stat })
					if (!filter || filter(entry)) {
						yield entry
					}
				}
				if (Math.abs(depth) > 0) {
					for (const [name, item] of index.entries) {
						if (item.isDirectory) {
							const subdir = this.resolveSync(uri, name)
							yield* this.readDir(subdir, { ...options, depth: depth - 1, context: authContext })
						}
					}
				}
				return
			}
		}

		try {
			const list = await this.listDir(uri, authContext)
			const files = []
			const dirs = []

			for (const entry of list) {
				// Apply filter if provided
				if (filter && !filter(entry)) {
					continue
				}

				// Apply ignore if provided
				if (ignore.length > 0) {
					const name = entry.name
					const isIgnored = ignore.some((pattern) => {
						if (/** @type {RegExp | string} */ (pattern) instanceof RegExp)
							return /** @type {RegExp} */ (pattern).test(name)
						if (pattern === '.*') return name.startsWith('.')
						return name === pattern || name.startsWith(pattern + '/')
					})
					if (isIgnored) continue
				}

				if (entry.isDirectory) {
					dirs.push(entry)
				} else {
					files.push(entry)
				}
			}

			// Yield directories first if depth > 0
			for (const dir of dirs) {
				if (includeDirs) {
					yield dir
				}
				if (Math.abs(depth) > 0) {
					const subdir = this.resolveSync(uri, dir.name)
					yield* this.readDir(subdir, { ...options, depth: depth - 1, context: authContext })
				}
			}

			// Yield files
			for (const file of files) {
				yield file
			}
		} catch (/** @type {any} */ err) {
			this.console.warn(`Failed to list directory: ${uri}`, err)
		}
	}

	/**
	 * Reads a specific branch at given depth
	 * @param {string} uri - URI for the branch
	 * @param {number} [depth=-1] - Depth of read
	 * @returns {Promise<AsyncGenerator<DocumentEntry, void, unknown>>}
	 */
	async readBranch(uri, depth = -1) {
		this.console.debug('readBranch()', uri, { uri, depth })
		return this.readDir(uri, { depth })
	}

	/**
	 * Ensures DB is connected. Throws if connection fails.
	 * @returns {Promise<void>}
	 * @throws {Error} If connection cannot be established
	 */
	async requireConnected() {
		this.console.debug('requireConnected()')
		if (!this.connected) {
			await this.connect()
		}
		if (!this.connected) {
			this.console.error('Database connection failed')
			throw new Error('DB is not connected')
		}
		this.console.info('Database connected successfully')
	}

	/**
	 * Searches for URI matching condition
	 * @param {string | ((path: string) => boolean)} uri - Search pattern or callback
	 * @param {number} [depth=0] - Maximum depth to search
	 * @yields {string} Full URI path of found documents
	 * @returns {AsyncGenerator<string, void, unknown>}
	 */
	async *find(uri, depth = 0) {
		this.console.debug('find()', uri, { depth })
		await this.requireConnected()
		const entries = []
		if (this.loaded) {
			for (const [path] of this.meta) {
				entries.push(path)
			}
		} else {
			this.console.debug('find().readDir()', uri)
			for await (const entry of this.readDir(this.root, { depth: depth + 1 })) {
				entries.push(entry.path)
			}
			this.console.debug('find().readDir().done', uri, { root: this.root, entries })
			this.meta.set('?loaded', new DocumentStat())
		}
		if ('function' === typeof uri) {
			for (const path of entries) {
				if (uri(path)) {
					yield path
				}
			}
		} else {
			if (entries.includes(uri)) {
				yield uri
			}
		}
	}



	/**
	 * Synchronize data with persistent storage
	 * Saves changed documents where local mtime > remote stat mtime.
	 * @param {string|undefined} [uri] Optional specific URI to save
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<string[]>} Array of saved URIs
	 */
	async push(uri = undefined, context = this.context) {
		this.console.debug('push()', uri)
		const authContext = AuthContext.from(context)
		if (uri) {
			await this.ensureAccess(uri, 'w', authContext)
		} else {
			for (const [key] of this.data) {
				await this.ensureAccess(key, 'w', authContext)
			}
		}
		const changed = []
		for (const [key, value] of this.data) {
			const meta = this.meta.get(key) ?? { mtimeMs: 0 }
			const stat = await this.statDocument(key, authContext)
			if (meta.mtimeMs > stat.mtimeMs) {
				changed.push(key)
				await this.saveDocument(key, value, authContext)
			}
		}
		return changed
	}

	/**
	 * Invalidate in-memory data cache for a URI and its absolute path.
	 * @param {string} uri - Document URI
	 */
	_invalidateDataCache(uri) {
		const normalized = this.normalize(uri)
		this.data.delete(normalized)
		this.data.delete(this.absolute(normalized))
	}

	/**
	 * Invalidate directory entry cache for a URI and all its parent directories.
	 * @param {string} uri - Document URI
	 */
	_invalidateDirCache(uri) {
		const normalized = this.normalize(uri)
		this._dirCache.delete(normalized)
		this._dirCache.delete(this.absolute(normalized))
		// Also invalidate parent directory caches
		let current = normalized
		while (current && current !== '.' && current !== '/') {
			const parent = this.dirname(current)
			if (parent === current) break
			this._dirCache.delete(parent)
			this._dirCache.delete(this.absolute(parent))
			current = parent
		}
	}


	/**
	 * Checks if the given URI contains data in the in-memory cache.
	 * @param {string} uri - Document URI
	 * @returns {boolean}
	 */
	isData(uri) {
		return this.data.has(uri) || this.data.has(this.absolute(uri))
	}

	/**
	 * Resolves path segments to absolute path
	 * @note Must be overwritten by platform-specific implementation
	 * @param  {...string} args - Path segments
	 * @returns {Promise<string>} Resolved absolute path
	 */
	async resolve(...args) {
		if (args.length > 0) {
			const aliased = this.resolveAlias(args[0])
			if (aliased !== args[0]) {
				this.console.debug('resolve() alias hit', { aliased })
				// Return the raw alias directly, without virtual boundaries,
				// so that it can point outside the root.
				return Promise.resolve(aliased)
			}
		}
		this.console.debug('resolve()', { args })
		return Promise.resolve(this.resolveSync(...args))
	}

	/**
	 * Normalize path segments to absolute path
	 * Handles .., ., and duplicate slashes.
	 * @param  {...string} args - Path segments
	 * @returns {string} Normalized path
	 */
	normalize(...args) {
		return normalize(...args)
	}
	/**
	 * Checks if current uri has scheme in it, such as http://, https://, ftp://, file://, etc.
	 * @param {string} uri
	 * @returns {boolean}
	 */
	isRemote(uri) {
		return isRemote(uri)
	}
	/**
	 * Checks if current uri is absolute (started from /) or remote.
	 * @param {string} uri
	 * @returns {boolean}
	 */
	isAbsolute(uri) {
		return isAbsolute(uri)
	}
	/**
	 * Resolves path segments to absolute path synchronously
	 * Combines cwd, root, and args with normalization.
	 * @param  {...string} args - Path segments
	 * @returns {string} Resolved absolute path
	 */
	resolveSync(...args) {
		return resolveSync(this.cwd, this.root, ...args)
	}

	/**
	 * Returns base name of URI with the removedSuffix (if provided).
	 * If removeSuffix is true the extension will be removed.
	 * @param {string} uri
	 * @param {string | true} [removeSuffix] - Suffix to remove or true for extension
	 * @returns {string}
	 */
	basename(uri, removeSuffix = '') {
		return basename(uri, removeSuffix)
	}

	/**
	 * Returns directory name of URI
	 * @param {string} uri
	 * @returns {string}
	 */
	dirname(uri) {
		return dirname(uri)
	}
	/**
	 * Gets absolute path
	 * @note Must be overwritten by platform-specific implementation
	 * @param  {...string} args - Path segments
	 * @returns {string} Absolute path
	 */
	absolute(...args) {
		this.console.debug('absolute()', { cwd: this.cwd, root: this.root, args })
		return absolute(this.cwd, this.root, ...args)
	}

	/**
	 * Returns physical location on the host filesystem for the provided uri.
	 * Routes to mounts if possible.
	 * @param {string} uri - Document URI
	 * @returns {string} Absolute location on the drive.
	 */
	location(uri) {
		const mount = this._findMount(uri)
		if (mount && typeof mount.db.location === 'function') {
			return mount.db.location(mount.subUri)
		}
		return this.absolute(uri)
	}
}
