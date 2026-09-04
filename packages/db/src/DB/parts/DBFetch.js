import { merge, clone } from '@nan0web/types'
import AuthContext from '../AuthContext.js'
import FetchOptions from '../FetchOptions.js'
import DBDir from './DBDir.js'

/**
 * Hierarchical fetch layer for the database.
 * Handles fetch, _fetchPrimary, fetchMerged, getInheritance, resolveReferences.
 * Extends DBDir to add hierarchical data fetching with inheritance, globals, and references.
 *
 * @class
 * @extends {DBDir}
 */
export default class DBFetch extends DBDir {
	/**
	 * Returns a ReadableStream for the document at the given URI.
	 * Base implementation wraps fetch() into a single-chunk stream.
	 * FS/network drivers can override for true chunked streaming.
	 * @param {string} uri - Document URI
	 * @param {object | FetchOptions} [input] - Fetch options
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {ReadableStream}
	 */
	fetchStream(uri, input = {}, context = this.context) {
		const db = this
		return new ReadableStream({
			async start(controller) {
				try {
					const data = await db.fetch(uri, input, context)
					if (data != null) {
						const chunk = typeof data === 'string' ? data : JSON.stringify(data)
						controller.enqueue(chunk)
					}
					controller.close()
				} catch (err) {
					controller.error(err)
				}
			},
		})
	}

	/**
	 * Fetch document with inheritance, globals and references processing.
	 * Handles extension lookup, directory resolution, and merging.
	 * @param {string} uri
	 * @param {object | FetchOptions} [input]
	 * @param {AuthContext | object | Set<string>} [contextOrVisited=this.context] - Auth context or visited set
	 * @param {Set<string>} [visited] - Set of visited URIs for circular reference detection
	 * @returns {Promise<any>}
	 */
	async fetch(uri, input = {}, contextOrVisited = this.context, visited = new Set()) {
		let context = contextOrVisited
		let visitedSet = visited
		if (contextOrVisited instanceof Set) {
			visitedSet = contextOrVisited
			context = this.context
		}

		const mount = this._findMount(uri)
		if (mount) return mount.db.fetch(mount.subUri, input, context, visitedSet)

		let result = await this._fetchPrimary(uri, input, context, visitedSet)

		// Fallback chain: if primary returned nothing and we have attached DBs
		if (result == null && this.dbs.length > 0) {
			for (const fallbackDB of this.dbs) {
				try {
					const fallbackResult = await fallbackDB.fetch(uri, input, context, visitedSet)
					if (fallbackResult != null) {
						this.emit('fallback', { uri, from: this, to: fallbackDB })
						result = fallbackResult
						break
					}
				} catch (e) {
					continue
				}
			}
		}

		// Model hydration: transform raw data into Model instances
		if (result != null && this.models.size > 0) {
			const ModelClass = this._findModel(uri)
			if (ModelClass) {
				result = this._hydrate(result, ModelClass)
			}
		}

		return result
	}

	/**
	 * Primary fetch logic — extracted for fallback chain support.
	 * @param {string} uri
	 * @param {object | FetchOptions} [input]
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<any>}
	 */
	async _fetchPrimary(uri, input = {}, context = this.context, visited = new Set()) {
		let opts = input instanceof FetchOptions ? input : FetchOptions.from(input)
		const authContext = AuthContext.from(context !== undefined ? context : this.context)
		this.console.debug('fetch()', uri, { uri, opts })
		// Handle extension-less URIs by trying common extensions
		let ext = this.extname(uri)
		let mightBeDirectory = false

		if (!ext) {
			mightBeDirectory = true
			// Check if this is a directory
			if (opts.allowDirs && uri.endsWith('/')) {
				try {
					const indexes = Array.isArray(this.Directory.INDEX) ? this.Directory.INDEX : [this.Directory.INDEX]
					for (const idx of indexes) {
						for (const extname of this.Directory.DATA_EXTNAMES) {
							const path = this.resolveSync(uri, idx + extname)
							const stat = await this.statDocument(path, authContext)
							if (stat.exists) {
								return await this.fetchMerged(path, opts, authContext, visited)
							}
						}
					}
				} catch (/** @type {any} */ err) {
					this.console.warn('Error checking if URI is directory', { uri, error: err.message })
					// Not a directory, continue with file extensions
				}
			}

			// If uri is an explicit directory (ends with '/'), do not look for files named 'dir/.ext'
			if (uri.endsWith('/')) {
				this.console.debug('fetch().fail', uri, { uri, opts })
				return opts.defaultValue
			}

			// Try to find a file with one of the supported extensions
			const extsToTry = [...this.Directory.DATA_EXTNAMES.slice(), '']
			for (const extension of extsToTry) {
				const fullUri = uri + extension
				const stat = await this.statDocument(fullUri, authContext)
				if (stat.exists && stat.isFile) {
					return await this.fetchMerged(fullUri, opts, authContext, visited)
				}
			}

			// If no file found, return default value
			this.console.debug('fetch().fail', uri, { uri, opts })
			return opts.defaultValue
		}

		// If extension is not supported, try to load as is
		if (!this.Directory.DATA_EXTNAMES.includes(ext)) {
			try {
				return await this.loadDocumentAs('.txt', uri, opts.defaultValue, authContext)
			} catch (/** @type {any} */ err) {
				// If loading fails, return default value
				this.console.warn('Error loading document with unsupported extension', {
					uri,
					error: err.message,
				})
				return opts.defaultValue
			}
		}

		// Try to load as file with extension
		try {
			const result = await this.fetchMerged(uri, opts, authContext, visited)
			return result
		} catch (/** @type {any} */ err) {
			// If it's a potential directory and directories are allowed, try as directory
			if (mightBeDirectory && opts.allowDirs) {
				try {
					const indexPath = await this.resolve(uri, this.Index.INDEX)
					if (indexPath === uri) {
						throw new Error('Impossible to have the same directory path as a request uri')
					}
					const result = await this.fetchMerged(indexPath, opts, authContext, visited)
					return result
				} catch (/** @type {any} */ dirErr) {
					this.console.warn('Error loading as directory', { uri, error: dirErr.message })
					return opts.defaultValue
				}
			}
			// If it's a potential directory and directories are NOT allowed, return default value
			if (mightBeDirectory) {
				this.console.debug('fetch().fail (directory not allowed)', uri, { uri, opts })
				return opts.defaultValue
			}
			throw err
		}
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
		const cacheKey = `path:${this.normalize(path)}`
		const cached = this._inheritanceCache.get(cacheKey)
		if (cached !== undefined) {
			return cached
		}

		const inheritanceChain = this.Data.getPathParents(path, '/')

		// Load root inheritance data
		if (!this._inheritanceCache.has('/')) {
			try {
				const rootData = await this.loadDocument(this.Directory.FILE)
				this._inheritanceCache.set('/', rootData)
				this.console.debug('getInheritance().loaded', path, { rootData })
			} catch (/** @type {any} */ err) {
				this.console.warn('Failed to load root inheritance data', { error: err.message })
				this._inheritanceCache.set('/', {})
			}
		}
		let mergedData = this._inheritanceCache.get('/') || {}

		for (const dirPath of inheritanceChain) {
			if (!this._inheritanceCache.has(dirPath)) {
				try {
					const uri = this.resolveSync(dirPath, this.Directory.FILE)
					const dirData = await this.loadDocument(uri)
					this._inheritanceCache.set(dirPath, dirData)
					this.console.debug('getInheritance().loaded', path, { dirPath, dirData })
				} catch (/** @type {any} */ err) {
					this.console.warn('Failed to load directory inheritance data', {
						dirPath,
						error: err.message,
					})
					this._inheritanceCache.set(dirPath, {})
				}
			}
			const dirData = this._inheritanceCache.get(dirPath) || {}
			mergedData = this.Data.merge(mergedData, dirData)
		}

		this._inheritanceCache.set(cacheKey, mergedData)
		this.console.debug('getInheritance().done', path, { mergedData })
		return mergedData
	}

	/**
	 * Merges data from multiple sources following nano-db-fetch patterns.
	 * Handles inheritance, globals, and references with circular protection.
	 * @param {string} uri - The URI to fetch and merge data for
	 * @param {FetchOptions} [opts] - Fetch options
	 * @param {AuthContext | Set<string>} [contextOrVisited] - Auth context or visited set
	 * @param {Set<string>} [visited=new Set()] - For internal circular reference protection
	 * @returns {Promise<any>} Merged data object
	 */
	async fetchMerged(
		uri,
		opts = new FetchOptions(),
		contextOrVisited = this.context,
		visited = new Set()
	) {
		const authContext = AuthContext.from(contextOrVisited)
		let visitedSet = visited
		if (contextOrVisited instanceof Set) {
			visitedSet = contextOrVisited
		}
		this.console.debug('fetchMerged()', uri, { uri, opts, visited: Array.from(visitedSet) })
		if (!(opts instanceof FetchOptions)) {
			opts = FetchOptions.from(opts)
		}
		const extname = this.extname(uri)
		const isData = !extname || this.Directory.DATA_EXTNAMES.includes(extname)

		// Prevent self-repeating
		if (visitedSet.has(uri)) {
			this.console.warn('Circular inheritance chain detected', { uri })
			return opts.defaultValue
		}
		const nextVisited = new Set(visitedSet).add(uri)

		// Load the document first
		let data = await this.loadDocument(uri, undefined, authContext)
		const isExtensible = 'object' === typeof data && null !== data && !Array.isArray(data)

		if (opts.inherit && isExtensible) {
			try {
				const parentData = await this.getInheritance(uri)
				if (parentData && Object.keys(parentData).length > 0) {
					data = this.Data.merge(parentData, data)
				}
			} catch (/** @type {any} */ err) {
				this.console.warn('Error processing inheritance', {
					uri,
					error: err.message,
				})
			}
		}

		if (opts.globals && isData && isExtensible) {
			const globals = await this.getGlobals(uri)
			if (globals && Object.keys(globals).length > 0) {
				data = this.Data.merge(globals, data)
			}
		}

		if (opts.refs && isData && isExtensible) {
			data = await this.resolveReferences(data, uri, opts, nextVisited)
		}

		return data || opts.defaultValue
	}

	_hasReference(data) {
		if (typeof data !== 'object' || data === null) return false
		const refKey = this.Data.REFERENCE_KEY
		const refPrefix = refKey + ':'
		for (const key of Object.keys(data)) {
			if (key === refKey || key.endsWith('.' + refKey) || key.endsWith('/' + refKey)) return true
			const val = data[key]
			if (typeof val === 'string' && val.startsWith(refPrefix)) return true
			if (typeof val === 'object' && val !== null) {
				if (this._hasReference(val)) return true
			}
		}
		return false
	}

	_findReferenceKeys(flat) {
		if (!Array.isArray(flat)) flat = Object.entries(flat)
		const inValue = this.Data.REFERENCE_KEY + ':'
		const inKey = this.Data.REFERENCE_KEY
		const path = this.Data.OBJECT_DIVIDER + inKey
		const isInKey = (key) => key.endsWith(path) || inKey === key
		return flat
			.filter(([key, val]) => isInKey(key) || ('string' === typeof val && val.startsWith(inValue)))
			.map(([key, val]) => [key, isInKey(key) ? val : val.slice(inValue.length)])
	}

	_getParentReferenceKey(key) {
		const inKey = this.Data.REFERENCE_KEY
		const path = this.Data.OBJECT_DIVIDER + inKey
		return key.endsWith(path) ? key.split(path)[0] : key
	}

	/**
	 * Handles document references and resolves them recursively with circular reference protection.
	 * Supports fragment references (e.g., #prop/subprop) and merges siblings.
	 * @param {object} data - Document data with potential references
	 * @param {string} [basePath] - Base path for resolving relative references
	 * @param {object|FetchOptions} [opts] - Options that will be passed to fetch
	 * @param {Set<string>} [visited] - Set of visited URIs to prevent circular references
	 * @returns {Promise<object>} Data with resolved references
	 */
	async resolveReferences(data, basePath = '', opts = new FetchOptions(), visited = new Set()) {
		this.console.debug('resolveReferences()', { data, basePath, visited: Array.from(visited) })

		if (typeof data !== 'object' || data === null || Array.isArray(data)) {
			return data
		}

		// Fast-path: check if document potentially contains any reference key or value
		// Reference keys typically contain '$' (like '$ref' or '$')
		const hasRef = this._hasReference(data)
		if (!hasRef) {
			return data
		}

		const flat = this.Data.flatten(data)
		const refKeys = this._findReferenceKeys(flat)
		if (refKeys.length === 0) {
			return data
		}
		const newFlat = { ...flat }
		const circulars = new Set()

		for (const [key, refPath] of refKeys) {
			try {
				let refString = refPath
				if (typeof refPath === 'object' && refPath !== null && this.Data.REFERENCE_KEY in refPath) {
					refString = refPath[this.Data.REFERENCE_KEY]
				}

				if (typeof refString !== 'string') {
					continue
				}

				const dir = this.dirname(basePath)
				const absPath = refString.startsWith('/')
					? this.normalize(refString)
					: this.resolveSync(dir, refString)

				// Avoid reading the same file we're currently processing
				// This prevents infinite loops when a file references itself
				if (absPath === basePath) {
					this.console.warn('Self-reference skipped', { ref: absPath })
					continue
				}

				if (visited.has(absPath)) {
					this.console.warn('Circular reference skipped', { ref: absPath })
					circulars.add(key)
					continue
				}

				let refValue

				if (absPath.includes('#')) {
					const [filePath, fragment] = absPath.split('#')
					const targetData = await this.fetch(filePath, { ...opts, references: false }, visited)
					refValue = this.Data.find(fragment.split('/').filter(Boolean), targetData) ?? undefined
				} else {
					refValue = await this.fetch(absPath, opts, visited)
				}

				if (refValue === undefined) {
					continue
				}

				const parentKey = this._getParentReferenceKey(key)
				const siblings = this.Data.flatSiblings(Object.entries(newFlat), key, parentKey).map(
					([k, val]) =>
						parentKey ? [k.slice((parentKey + this.Data.OBJECT_DIVIDER).length), val] : [k, val]
				)

				if (parentKey === '' && key === this.Data.REFERENCE_KEY) {
					delete newFlat[key]
					for (const [k, v] of Object.entries(refValue)) {
						newFlat[k] = v
					}
				} else if (siblings.length > 0) {
					newFlat[parentKey] = this.Data.merge(
						typeof refValue === 'object' ? refValue : { value: refValue },
						Object.fromEntries(siblings)
					)
					// Cleanup sibling keys
					for (const [k] of siblings) {
						delete newFlat[parentKey + this.Data.OBJECT_DIVIDER + k]
					}
				} else {
					newFlat[parentKey || key] = refValue
				}

				// Cleanup child keys
				const prefix = (parentKey || key) + this.Data.OBJECT_DIVIDER
				Object.keys(newFlat).forEach((k) => {
					if (k.startsWith(prefix) && k !== (parentKey || key)) {
						delete newFlat[k]
					}
				})
			} catch (/** @type {any} */ err) {
				this.console.warn('Error resolving reference', { key, error: err.message })
			}
		}
		if (
			flat[this.Data.REFERENCE_KEY] &&
			'object' === typeof newFlat[this.Data.REFERENCE_KEY] &&
			newFlat[this.Data.REFERENCE_KEY]
		) {
			const base = clone(newFlat[this.Data.REFERENCE_KEY])
			delete flat[this.Data.REFERENCE_KEY]
			const obj = this.Data.unflatten(flat)
			return merge(obj, base)
		}

		return this.Data.unflatten(newFlat)
	}
}

