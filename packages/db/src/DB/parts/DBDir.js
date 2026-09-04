import AuthContext from '../AuthContext.js'
import DocumentStat from '../../DocumentStat.js'
import DocumentEntry from '../../DocumentEntry.js'
import StreamEntry from '../../StreamEntry.js'
import DirectoryIndex from '../../DirectoryIndex.js'
import DBDoc from './DBDoc.js'

/**
 * Directory, indexing, and search layer for the database.
 * Handles listDir, readDir, browse, find, findStream, buildIndexes, getGlobals.
 * Extends DBDoc to add directory-level operations.
 *
 * @class
 * @extends {DBDoc}
 */
export default class DBDir extends DBDoc {
	/**
	 * Lists directory contents at the given URI.
	 * Implements _dirCache for positive and negative caching of directory listings.
	 * @param {string} uri - Directory URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<DocumentEntry[]>} Array of document entries
	 */
	async listDir(uri, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) {
			const entries = await mount.db.listDir(mount.subUri, context)
			// Find the mount prefix to re-prefix entries
			const normalized = this.normalize(uri)
			let prefix = ''
			for (const [p] of this.mounts) {
				if (p === '' || normalized === p || normalized.startsWith(p + '/')) {
					prefix = p
					break
				}
			}
			return entries.map((e) => {
				e.path = this.resolveSync(prefix, e.path)
				if (e.parent) {
					e.parent = this.resolveSync(prefix, e.parent)
				}
				return e
			})
		}

		this.console.debug('listDir()', uri)
		const authContext = AuthContext.from(context)
		await this.ensureAccess(uri, 'r', authContext)

		// Check directory cache first
		const normalizedUri = this.normalize(uri)
		const cachedEntries = this._dirCache.get(normalizedUri)
		if (cachedEntries !== undefined) {
			return cachedEntries
		}

		let entries
		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const driverEntries = await this.driver.listDir(abs)
				if (driverEntries && driverEntries.length > 0) {
					entries = driverEntries.map((name) => {
						const isDir = name.endsWith('/')
						const entryPath = uri === '.' ? name : this.resolveSync(uri, name)
						return new DocumentEntry({
							name,
							path: entryPath,
							stat: { isDirectory: isDir, isFile: !isDir },
						})
					})
					this._dirCache.set(normalizedUri, entries)
					return entries
				}
			} catch (error) {
				this.console.error('Cannot list directory', { uri, abs, error })
			}
		}
		const localUri = uri === '/' ? '.' : uri.startsWith('/') && uri.length > 1 ? uri.slice(1) : uri
		const prefix = localUri === '.' ? '' : localUri.endsWith('/') ? localUri : localUri + '/'
		const depth = (localUri.endsWith('/') ? localUri.slice(0, -1) : localUri)
			.split('/')
			.filter(Boolean).length
		const keys = Array.from(this.meta.keys())
		const filtered = keys.filter((key) => {
			if (!key.startsWith(prefix) || key === prefix || this.isRoot(key)) return false
			const d = (key.endsWith('/') ? key.slice(0, -1) : key).split('/').filter(Boolean).length
			return d === depth + (this.isRoot(localUri) ? 0 : 1)
		})
		entries = filtered.map((path) => {
			const isDir = path.endsWith('/')
			const stat = isDir
				? new DocumentStat({ isDirectory: true, mtimeMs: Date.now() })
				: this.meta.get(path) || new DocumentStat({ isFile: true, mtimeMs: Date.now() })
			return new DocumentEntry({ path, stat })
		})
		// Cache even empty results for negative caching
		this._dirCache.set(normalizedUri, entries)
		return entries
	}

	/**
	 * Push stream of progress state
	 * Traverses directory with sorting, limiting, and loading options.
	 * Yields StreamEntry with cumulative stats and errors.
	 * @param {string} uri - Starting URI
	 * @param {object} [options] - Stream options
	 * @param {AuthContext | object} [options.context] - Auth context
	 * @param {Function} [options.filter] - Filter function
	 * @param {number} [options.limit] - Limit number of entries
	 * @param {'name'|'mtime'|'size'} [options.sort] - The sort criteria
	 * @param {'asc'|'desc'} [options.order] - Sort order
	 * @param {boolean} [options.skipStat] - Skip statistics
	 * @param {boolean} [options.skipSymbolicLink] - Skip symbolic links
	 * @param {boolean} [options.load=false] - Load data files into memory
	 * @yields {StreamEntry} Progress state
	 * @returns {AsyncGenerator<StreamEntry, void, unknown>}
	 */
	async *findStream(uri, options = {}) {
		const {
			filter = () => true,
			limit = -1,
			sort = 'name',
			order = 'asc',
			skipStat = false,
			skipSymbolicLink = false,
			load = false,
			context,
		} = options
		this.console.debug('findStream()', uri, { options })
		const authContext = AuthContext.from(context || this.context)
		/** @type {Map<string, DocumentEntry>} */
		let dirs = new Map()
		/** @type {Map<string, DocumentEntry>} */
		let top = new Map()
		/** @type {Map<string, Error | null>} */
		let errors = new Map()

		const sortFn = (a, b) => {
			if (sort === 'name') {
				return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
			}
			if (sort === 'mtime') {
				return order === 'asc' ? a.stat.mtime - b.stat.mtime : b.stat.mtime - a.stat.mtime
			}
			if (sort === 'size') {
				return order === 'asc' ? a.stat.size - b.stat.size : b.stat.size - a.stat.size
			}
			return 0
		}

		const totalSize = { dirs: 0, files: 0 }

		await this.ensureAccess(uri, 'r', authContext)

		const files = []
		for await (const file of this.readDir(uri, {
			skipStat,
			skipSymbolicLink,
			filter,
			context: authContext,
		})) {
			files.push(file)
			if (file.stat.error) {
				errors.set(file.path, file.stat.error)
			}
			if (file.stat.isDirectory) {
				dirs.set(file.path, file)
				totalSize.dirs += file.stat.size
			}
			totalSize.files += file.stat.isFile ? file.stat.size : 0

			// Populate top entries (only immediate children of the root URI)
			const relativePath = file.path.startsWith(uri) ? file.path.substring(uri.length) : file.path
			const parts = relativePath.split('/').filter(Boolean)
			if (parts.length === 1 || (relativePath.endsWith('/') && 2 === parts.length)) {
				top.set(file.name, file)
			}

			const entry = new StreamEntry({
				file,
				files: files.sort(sortFn),
				dirs,
				top,
				errors,
				progress: 0,
				totalSize,
			})
			yield entry
			if (!skipStat) this.meta.set(file.path, file.stat)
			if (load && this.isData(file.path)) {
				const data = await this.loadDocument(file.path, undefined, authContext)
				this.data.set(file.path, data)
			}
			if (limit > 0 && files.length >= limit) break
		}
	}

	/**
	 * Returns TRUE if uri is a data file.
	 * Checks against supported DATA_EXTNAMES.
	 * @param {string} uri
	 * @returns {boolean}
	 */
	isData(uri) {
		const ext = this.extname(uri)
		return (ext && this.Directory.DATA_EXTNAMES.includes(ext)) || !ext
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
	 * Builds indexes inside the directory.
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
	 * Saves index data to both index.jsonl and index.txt files
	 * @param {string} dirUri Directory URI where indexes should be saved
	 * @param {Array<[string, DocumentStat]>} [entries] Document entries with their paths, if not provided this.meta is used.
	 * @returns {Promise<void>}
	 */
	async saveIndex(dirUri, entries) {
		this.console.debug('saveIndex()', dirUri, { entries })
		if (!entries) {
			const base = this.normalize(dirUri)
			entries = Array.from(this.meta.entries()).filter(([uri]) => uri.startsWith(base))
		}
		const longIndex = this.resolveSync(dirUri, this.Index.FULL_INDEX)
		const dirIndex = this.resolveSync(dirUri, this.Index.INDEX)

		const index = this.Index.from({ entries })

		await this.saveDocument(longIndex, index.encode({ inc: true, long: true }))
		await this.saveDocument(dirIndex, index.encode())
	}

	/**
	 * Loads index data from either index.jsonl or index.txt file
	 * @param {string} [dirUri] Directory URI where index file is located
	 * @returns {Promise<DirectoryIndex>} Index data.
	 */
	async loadIndex(dirUri = '.') {
		const indexes = [
			this.resolveSync(this.Index.FULL_INDEX),
			this.resolveSync(dirUri, this.Index.INDEX),
		]
		for (const path of indexes) {
			try {
				const entries = await this.loadDocument(path)
				if (!entries) {
					throw new Error(['Empty index', path].join(': '))
				}
				return this.Index.decode(entries)
			} catch (/** @type {any} */ err) {
				this.console.warn(err.message)
			}
		}
		// No index found
		return new DirectoryIndex()
	}

	/**
	 * Fetches the index document for a directory.
	 * Returns empty object if index does not exist or Directory configuration is missing.
	 * @param {string} [dir=''] - The directory path
	 * @returns {Promise<Record<string, any>>}
	 */
	async fetchIndex(dir = '') {
		const Class = /** @type {typeof DBDir} */ (this.constructor)
		const Directory = Class.Directory
		if (!Directory || !Directory.INDEX) return {}
		const indexPath = dir ? this.resolveSync(dir, Directory.INDEX) : Directory.INDEX
		return (await this.fetch(indexPath)) ?? {}
	}

	/**
	 * Recursively builds a directory tree structure.
	 * @param {string} dirPath The directory path.
	 * @param {Array<[string, DocumentStat]>} [entries=[]] Entries to extend with the files found.
	 * @param {number} [depth=0] The depth level.
	 * @returns {Promise<Array<[string, DocumentStat]>>}
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
	 * Auto-updates index.jsonl and index.txt after document save for all parent directories
	 * @param {string} uri - URI of saved document
	 * @returns {Promise<void>}
	 */
	async _updateIndex(uri) {
		this.console.debug('_updateIndex()', uri)
		const base = this.basename(uri)
		if ([this.Index.FULL_INDEX, this.Index.INDEX].includes(base)) {
			return
		}
		const indexUris = DirectoryIndex.getIndexesToUpdate(/** @type {any} */ (this), uri)
		for (const indexPath of indexUris) {
			const dirPath = this.dirname(indexPath)
			const entries = await DirectoryIndex.getDirectoryEntries(/** @type {any} */ (this), dirPath)
			await this.saveIndex(dirPath, entries)
		}
		this.console.debug('_updateIndex().done', uri, {
			indexesUpdated: indexUris.length,
			paths: indexUris,
		})
	}

	/**
	 * Gets inheritance data for a given path
	 * Loads and merges directory-level settings (e.g., _.json files) up the hierarchy.
	 * Caches results to avoid redundant loads.
	 * @param {string} path - Document path
	 * @returns {Promise<any>} Inheritance data
	 */
	async getInheritance(path) {
		this.console.debug('getInheritance()', path)
		const inheritanceChain = this.Data.getPathParents(path, '/')

		// Load root inheritance data
		if (!this._inheritanceCache.has('/')) {
			try {
				const rootData = await this.loadDocument(this.Directory.FILE)
				this._inheritanceCache.set('/', rootData)
				this.console.debug('getInheritance().loaded', path, { rootData })
			} catch (/** @type {any} */ err) {
				this.console.debug('getInheritance().no-root-file', path)
			}
		}

		const result = this._inheritanceCache.get('/') ?? {}

		// Load per-directory inheritance
		for (let i = 0; i < inheritanceChain.length; i++) {
			const dirPath = inheritanceChain[i]
			if (dirPath === '/') continue // Already loaded root
			const cacheKey = `${dirPath}/${this.Directory.FILE}`
			if (!this._inheritanceCache.has(cacheKey)) {
				try {
					const dirData = await this.loadDocument(`${dirPath}/${this.Directory.FILE}`)
					this._inheritanceCache.set(cacheKey, dirData)
				} catch {
					continue
				}
			}
			const dirData = this._inheritanceCache.get(cacheKey)
			if (dirData) {
				Object.assign(result, dirData)
			}
		}

		this.console.debug('getInheritance().done', path, { result })
		return result
	}

	/**
	 * Gets global variables for a given path.
	 * Uses _dirCache to prevent redundant listDir calls.
	 * @param {string} path - Document path
	 * @returns {Promise<Record<string, any>>} Global variables
	 */
	async getGlobals(path) {
		this.console.debug('getGlobals()', path)

		// Check global cache first
		const normalizedPath = this.normalize(path)
		const cachedGlobals = this._dirCache.get(`globals:${normalizedPath}`)
		if (cachedGlobals !== undefined) {
			return cachedGlobals
		}

		let globals = {}

		try {
			const paths = this.Data.getPathParents(path, '/' + this.Directory.GLOBALS)
			for (let uri of paths) {
				if (uri.startsWith('/')) uri = uri.slice(1)
				const stream = this.readDir(uri)
				for await (const entry of stream) {
					// Only process files (not directories) in the _/ directory, and exclude directory index files (index, README)
					if (entry.isFile && !this.Directory.isIndex(entry.name)) {
						const key = this.resolveSync(uri, entry.name)
						const value = await this.loadDocument(key)
						if (undefined !== value) {
							globals[this.basename(entry.name, true)] = value
						}
					}
				}
			}
		} catch (/** @type {any} */ err) {
			this.console.warn('Error reading global variables directory', { path, error: err.message })
			// If no _/ directory or error reading it, continue with empty object
		}

		// Cache result for subsequent calls
		this._dirCache.set(`globals:${normalizedPath}`, globals)

		this.console.debug('getGlobals().done', path, { globals })
		return globals
	}

	/**
	 * Browses files recursively like `ls -r`.
	 * @param {string} [uri='.'] - Directory URI
	 * @param {object} [options]
	 * @param {number} [options.depth=-1] - Recursion depth (-1 unlimited)
	 * @param {boolean} [options.includeDirs=false] - Include directories
	 * @param {boolean} [options.skipIndex=false] - Skip index files
	 * @param {string[]} [options.ignore=[]] - Patterns to ignore
	 * @param {Function} [options.filter] - Custom filter function
	 * @yields {DocumentEntry} File entries
	 */
	async *browse(uri = '.', options = {}) {
		const {
			depth = -1,
			includeDirs = false,
			skipIndex = false,
			ignore = [],
			...readOptions
		} = options
		for await (const entry of this.readDir(uri, {
			...readOptions,
			depth,
			includeDirs,
			skipIndex,
			ignore,
		})) {
			if (entry.isFile || includeDirs) yield entry
		}
	}
}

