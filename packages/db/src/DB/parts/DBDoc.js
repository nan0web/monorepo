import AuthContext from '../AuthContext.js'
import DocumentStat from '../../DocumentStat.js'
import DBAccess from './DBAccess.js'

/**
 * Document read/write layer for the database.
 * Handles loading, saving, deleting, and streaming documents with caching.
 * Extends DBAccess to add document-level operations.
 *
 * @class
 * @extends {DBAccess}
 */
export default class DBDoc extends DBAccess {
	/**
	 * Gets document content from cache or loads if missing.
	 * Supports default fallback value for missing documents.
	 * @param {string} uri - Document URI
	 * @param {object | any} [input] - Options or GetOptions instance
	 * @param {AuthContext | object} [context] - Auth context
	 * @returns {Promise<any>} Document content
	 */
	async get(uri, input = {}, context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.get(mount.subUri, input, context)
		let opts
		if (context !== undefined) {
			opts = this.GetOptions.from(input)
		} else {
			opts = this.GetOptions.from(input || {})
			context = this.context
		}
		const authContext = AuthContext.from(context)
		uri = this.normalize(uri)
		this.console.debug('get()', uri, { opts })
		await this.ensureAccess(uri, 'r', authContext)
		if (!this.data.has(uri) || false === this.data.get(uri)) {
			const data = await this.loadDocument(uri, opts.defaultValue, authContext)
			this.console.debug('get().done', uri, { data, cache: false })
			this.emit('cache', { hit: false, uri })
			this.data.set(uri, data)
			return data
		}
		const data = this.data.get(uri)
		this.console.debug('get().done', uri, { data, cache: true })
		this.emit('cache', { hit: true, uri })
		return data
	}

	/**
	 * Parallel batch get — fetches multiple URIs concurrently.
	 * @param {string[]} uris - Array of document URIs
	 * @param {object | any} [input] - Options passed to each get()
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<Map<string, any>>} Map of URI → content
	 */
	async getAll(uris, input = {}, context = this.context) {
		/** @type {[string, any][]} */
		const results = await Promise.all(
			uris.map(async (uri) => [uri, await this.get(uri, input, context)])
		)
		return new Map(results)
	}

	/**
	 * Sets document content in cache and updates metadata timestamp.
	 * @param {string} uri - Document URI
	 * @param {any} data - Document data
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<any>} The set data
	 */
	async set(uri, data, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.set(mount.subUri, data, context)
		const authContext = AuthContext.from(context)
		this.console.debug('set()', uri, { data })
		await this.ensureAccess(uri, 'w', authContext)
		this.data.set(uri, data)
		const meta = this.meta.has(uri) ? this.meta.get(uri) : {}
		this.meta.set(uri, new DocumentStat({ isFile: true, ...meta, mtimeMs: Date.now() }))
		this.emit('change', { uri, type: 'set', data })
		return data
	}

	/**
	 * Batch set — writes multiple entries with a single-pass index update.
	 * @param {Array<[string, any]>} entries - Array of [uri, data] pairs
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<Map<string, any>>} Map of URI → written data
	 */
	async setAll(entries, context = this.context) {
		const results = new Map()
		for (const [uri, data] of entries) {
			const result = await this.set(uri, data, context)
			results.set(uri, result)
		}
		return results
	}

	/**
	 * Gets document statistics from cache or loads if missing.
	 * Supports extension fallback for extension-less URIs.
	 * @param {string} uri - Document URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<DocumentStat | undefined>}
	 */
	async stat(uri, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.stat(mount.subUri, context)
		const authContext = AuthContext.from(context)
		this.console.debug('stat()', uri)
		await this.ensureAccess(uri, 'r', authContext)
		if (!this.meta.has(uri)) {
			const stat = await this.statDocument(uri, authContext)
			this.console.debug('stat().done', uri, { stat, cache: false })
			this.meta.set(uri, stat)
		}
		const stat = this.meta.get(uri)
		this.console.debug('stat().done', uri, { stat, cache: true })
		return stat
	}

	/**
	 * Moves a document from one URI to another URI
	 * Loads source, saves to target, drops source, updates indexes.
	 * @param {string} from - Source URI
	 * @param {string} to - Target URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<boolean>} Success status
	 */
	async moveDocument(from, to, context = this.context) {
		this.console.debug('moveDocument()', { from, to })
		const authContext = AuthContext.from(context)
		await this.ensureAccess(to, 'w', authContext)
		await this.ensureAccess(from, 'r', authContext)
		if (this.driver) {
			const absoluteFrom = this.absolute(from)
			const result = await this.driver.move(absoluteFrom, this.absolute(to))
			if (true === result) {
				await this._updateIndex(absoluteFrom)
			}
			if (false === result) {
				return false
			}
		}

		const data = await this.loadDocument(from, undefined, authContext)
		await this.saveDocument(to, data, authContext)
		await this.dropDocument(from, authContext)
		const abs = this.normalize(await this.resolve(from))
		await this._updateIndex(abs)
		return true
	}

	/**
	 * Loads a document.
	 * Must be overwritten to have the proper file or database document read operation.
	 * In a basic class it just loads already saved data in the db.data map.
	 * Supports extension fallback for extension-less URIs.
	 * @param {string} uri - Document URI
	 * @param {any} [defaultValue] - Default value if document not found
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<any>}
	 */
	async loadDocument(uri, defaultValue, context = this.context) {
		this.console.debug('loadDocument()', uri, { defaultValue })
		return await this.loadDocumentAs(this.extname(uri), uri, defaultValue, context)
	}

	/**
	 * Loads a document using a specific extension handler.
	 * Implements in-memory caching via this.data Map.
	 * @param {string} ext The extension of the document.
	 * @param {string} uri The URI to load the document from.
	 * @param {any} defaultValue The default value to return if the document does not exist.
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<any>} The loaded document or the default value.
	 */
	async loadDocumentAs(ext, uri, defaultValue, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.loadDocumentAs(ext, mount.subUri, defaultValue, context)
		this.console.debug('loadDocumentAs()', uri, { ext, defaultValue })
		const authContext = AuthContext.from(context)
		uri = this.normalize(uri)

		// Check in-memory cache first
		const cached = this.data.get(uri)
		if (cached !== undefined) {
			return cached
		}

		await this.ensureAccess(uri, 'r', authContext)
		const stats = await this.statDocument(uri)
		if (stats.exists && stats.isFile) {
			if (this.driver) {
				const abs = this.absolute(uri)
				const result = await this.driver.read(abs)
				if (undefined !== result) {
					this.data.set(uri, result)
					return result
				}
			}
			const memData = this.data.get(uri)
			if (memData !== undefined) {
				return memData
			}
		} else {
			if (!ext) {
				for (const ext of this.Directory.DATA_EXTNAMES) {
					const stats = await this.statDocument(uri + ext)
					if (stats.exists && stats.isFile) {
						const data = await this.loadDocument(uri + ext, null, authContext)
						if (null !== data) {
							return data
						}
					}
				}
			}
		}
		return defaultValue
	}

	/**
	 * Returns a read stream of the document.
	 * @param {string} uri - Document URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<any>}
	 */
	async stream(uri, context = this.context) {
		const mount = this._findMount(uri)
		if (mount && typeof mount.db.stream === 'function') {
			return mount.db.stream(mount.subUri, context)
		}
		this.console.debug('stream()', uri)
		const authContext = AuthContext.from(context)
		uri = this.normalize(uri)
		await this.ensureAccess(uri, 'r', authContext)

		if (this.driver && typeof this.driver.stream === 'function') {
			const abs = this.absolute(uri)
			const _stream = await this.driver.stream(abs)
			if (_stream) {
				return _stream
			}
		}

		throw new Error('Streaming is not supported by this database or driver')
	}

	/**
	 * Saves raw file content directly without parsing or serialization.
	 * @param {string} uri - Document URI
	 * @param {string|Buffer} content - Raw content to write
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<boolean>}
	 */
	async saveFile(uri, content, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) {
			const anyDb = /** @type {any} */ (mount.db)
			if (typeof anyDb.saveFile === 'function') {
				return anyDb.saveFile(mount.subUri, content, context)
			}
			if (typeof anyDb.saveDocumentAs === 'function') {
				return anyDb.saveDocumentAs('.txt', mount.subUri, content, context)
			}
			if (typeof anyDb.saveDocument === 'function') {
				return anyDb.saveDocument(mount.subUri, content, context)
			}
			if (typeof anyDb.set === 'function') {
				return anyDb.set(mount.subUri, content, context)
			}
			return anyDb.save(mount.subUri, content, context)
		}
		this.console.debug('saveFile()', uri, { content })
		const authContext = AuthContext.from(context)
		await this.ensureAccess(uri, 'w', authContext)
		const abs = this.normalize(await this.resolve(uri))
		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const result = await this.driver.write(abs, content)
				if (false === result) {
					throw new Error('Unable to save with a driver: ' + this.driver.constructor.name)
				}
			} catch (error) {
				this.console.error('Cannot save file', { uri, abs, content, context, error })
				return false
			}
		}

		this.data.set(abs, content)
		const stat = this._statFromMeta(abs)
		stat.isFile = true
		stat.mtimeMs = Date.now()
		stat.size = Buffer.byteLength(String(content))
		this.meta.set(abs, stat)
		await this._updateIndex(abs)
		this.emit('change', { uri, type: 'save', data: content })
		return true
	}

	/**
	 * Save the document.
	 * Implements in-memory caching: updates this.data with both normalized URI and absolute path.
	 * Invalidates directory cache on save.
	 * @param {string} uri - Document URI
	 * @param {any} document - Document to save
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<boolean>}
	 */
	async saveDocument(uri, document, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.saveDocument(mount.subUri, document, context)
		this.console.debug('saveDocument()', uri, { document })
		const authContext = AuthContext.from(context)
		await this.ensureAccess(uri, 'w', authContext)
		const abs = this.normalize(await this.resolve(uri))
		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const result = await this.driver.write(abs, document)
				if (false === result) {
					throw new Error('Unable to save with a driver: ' + this.driver.constructor.name)
				}
			} catch (error) {
				this.console.error('Cannot save a document', { uri, abs, document, context, error })
				return false
			}
		}

		// Invalidate directory cache for affected paths
		this._invalidateDirCache(uri)
		this._invalidateDirCache(abs)

		this.data.set(uri, document)
		this.data.set(abs, document)
		const stat = this._statFromMeta(abs)
		stat.isFile = true
		stat.mtimeMs = Date.now()
		stat.size = Buffer.byteLength(JSON.stringify(document))
		this.meta.set(abs, stat)
		await this._updateIndex(abs)
		this.emit('change', { uri, type: 'save', data: document })
		return true
	}

	/**
	 * Reads statistics for a specific document.
	 * Must be overwritten to have the proper file or database document stat operation.
	 * In a basic class it just returns a document stat from the db.meta map if exists.
	 * @note Must be overwritten by platform-specific implementation
	 * @param {string} uri - Document URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<DocumentStat>}
	 */
	async statDocument(uri, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.statDocument(mount.subUri, context)
		this.console.debug('statDocument()', uri)
		const authContext = AuthContext.from(context)
		if ('.' === uri) uri = './'
		await this.ensureAccess(uri, 'r', authContext)
		let abs = this.normalize(await this.resolve(uri)) || '.'
		if (uri.endsWith('/') && !abs.endsWith('/')) abs += '/'

		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const stats = await this.driver.stat(abs)
				if (stats) {
					this.meta.set(abs, stats)
					return stats
				}
			} catch {
				this.console.error('Cannot stat a document', { uri, abs })
			}
		}

		return this._statFromMeta(abs)
	}

	/**
	 * Writes data to a document with overwrite
	 * @param {string} uri - Document URI
	 * @param {string} chunk - Data to write
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<boolean>} Success status
	 */
	async writeDocument(uri, chunk, context = this.context) {
		this.console.debug('writeDocument()', uri, { chunk })
		const authContext = AuthContext.from(context)
		await this.ensureAccess(uri, 'w', authContext)
		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const result = await this.driver.append(abs, chunk)
				if (false === result) {
					throw new Error('Unable to write document')
				}
			} catch (error) {
				this.console.error('Cannot append document', { uri, abs, error })
				return false
			}
		}
		const str = String(this.data.get(uri) || '')
		this.data.set(uri, str + chunk)
		this.meta.set(
			uri,
			new DocumentStat({
				isFile: true,
				size: str.length + chunk.length,
				mtimeMs: Date.now(),
			})
		)
		return true
	}

	/**
	 * Delete document from storage.
	 * Invalidates both data and directory caches for the deleted URI.
	 * @param {string} uri - Document URI
	 * @param {AuthContext | object} [context=this.context] - Auth context
	 * @returns {Promise<boolean>} TRUE if success, FALSE if fail
	 */
	async dropDocument(uri, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) return mount.db.dropDocument(mount.subUri, context)
		this.console.debug('dropDocument()', uri)
		const authContext = AuthContext.from(context)
		try {
			await this.ensureAccess(uri, 'd', authContext)
		} catch (error) {
			this.console.error('No access to delete the document', { uri, context, error })
			return false
		}
		if (this.driver) {
			const abs = this.absolute(uri)
			try {
				const result = await this.driver.delete(abs)
				if (false === result) {
					throw new Error('Could not delete document')
				}
			} catch (error) {
				this.console.error('Cannot delete document', { uri, abs, context, error })
				return false
			}
		}
		const abs = this.normalize(await this.resolve(uri))
		this._invalidateDataCache(uri)
		this._invalidateDataCache(abs)
		this._invalidateDirCache(uri)
		this._invalidateDirCache(abs)
		this.data.delete(uri)
		this.data.delete(abs)
		this.meta.delete(uri)
		this.meta.delete(abs)
		this.console.debug('Document deleted', { uri })
		this.emit('change', { uri, type: 'drop' })
		return true
	}
}
