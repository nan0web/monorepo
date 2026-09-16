import { DocumentStat } from '@nan0web/db'
import DBFSPath from './DBFSPath.js'

/**
 * Document operations layer for filesystem database.
 * Handles reading, saving, streaming, appending, and deleting documents.
 *
 * @class
 * @extends {DBFSPath}
 */
export default class DBFSDoc extends DBFSPath {
	/**
	 * Ensures the current operation has proper access rights.
	 * @param {string} uri The URI to check access for.
	 * @param {"r"|"w"|"d"} [level="r"] The access level: read, write, or delete.
	 * @returns {Promise<void>}
	 */
	async ensureAccess(uri, level = 'r') {
		await super.ensureAccess(uri, level)
		const file = this.resolveSync(uri)
		if (uri.endsWith('/llm.config.js') || uri !== this.resolveAlias(uri)) {
			/** @note load config file or explicit aliases from anywhere */
			return
		}
		if (file.startsWith('..')) {
			throw new Error('No access outside of the db container')
		}
	}

	/**
	 * Returns the stat of the document without meta (cache) check.
	 * ```
	 * NO ACCESS CHECK!
	 * ```
	 * @param {string} uri The URI to stat the document from.
	 * @returns {Promise<DocumentStat>} The document stat.
	 */
	async statDocument(uri) {
		this.console.debug('Getting document statistics', { uri })
		const path = this.location(uri)
		try {
			if (!(await this.FS.exists(path))) {
				return new DocumentStat({
					error: new Error('Document not found'),
				})
			}
			const stat = await this.FS.stat(path)
			return DocumentStat.from(stat)
		} catch (/** @type {any} */ err) {
			return new DocumentStat({
				error: err,
			})
		}
	}

	/**
	 * Ensures the directory path for a given URI exists, creating it if necessary.
	 * @param {string} uri The URI to build the path for.
	 * @returns {Promise<void>}
	 */
	async _buildPath(uri) {
		const dir = await this.resolve(uri, '..')
		const path = this.location(dir)
		await this.FS.mkdir(path, { recursive: true })
	}

	/**
	 * Loads a document using a specific extension handler.
	 * @param {string} ext The extension of the document.
	 * @param {string} uri The URI to load the document from.
	 * @param {any} defaultValue The default value to return if the document does not exist.
	 * @returns {Promise<any>} The loaded document or the default value.
	 */
	async loadDocumentAs(ext, uri, defaultValue = undefined) {
		this.console.debug('Loading document as', { uri, ext, defaultValue })
		await this.ensureAccess(uri, 'r')
		const file = this.resolveSync(this.resolveAlias(uri))
		const path = this.location(uri)
		if (!(await this.FS.exists(path))) {
			let baseUri = uri
			let isDataExt = false
			if (ext) {
				if (this.Directory.DATA_EXTNAMES.includes(ext)) {
					isDataExt = true
					baseUri = uri.substring(0, uri.length - ext.length)
				}
			}
			if (!ext || isDataExt) {
				for (const fallbackExt of this.Directory.DATA_EXTNAMES) {
					if (fallbackExt === ext) continue
					const stats = await this.statDocument(baseUri + fallbackExt)
					if (stats.exists && stats.isFile) {
						const data = await this.loadDocument(baseUri + fallbackExt, null)
						if (null !== data) {
							return data
						}
					}
				}
			}
			return this.data.has(file) ? this.data.get(file) : defaultValue
		}

		const loader = this.registry.resolveLoader(ext)
		try {
			const raw = this.FS.loadTXT(path, '', true)
			return loader(/** @type {string} */ (raw), /** @type {string} */ (ext))
		} catch (error) {
			return defaultValue
		}
	}

	/**
	 * Saves a document to the given URI, forcing a specific extension / format wrapper.
	 * @throws {Error} If the document cannot be saved.
	 * @param {string} ext The extension/format of the document (e.g. '.txt').
	 * @param {string} uri The URI to save the document to.
	 * @param {any} document The document to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveDocumentAs(ext, uri, document) {
		this.console.debug('Saving document as', { uri, ext, document })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const file = await this.resolve(uri)
		const cleanFile = file.startsWith('/') ? file.slice(1) : file
		const path = this.FS.resolve(this.cwd, this.root, cleanFile)
		const saver = this.registry.resolveSaver(ext)
		try {
			const raw = saver(document, ext) // Validation errors can be thrown here
			await this.FS.saveAsync(path, raw, '.txt')
			const stat = await this.statDocument(uri)
			this.meta.set(uri, stat)
			this.data.set(uri, false)
			this.emit('change', { uri, type: 'save', data: document })
			return true
		} catch (/** @type {any} **/ e) {
			// Log validation errors
			this.console.error('Document validation failed', { uri, ext, error: e.message })
			// Re-throw with more context
			throw new Error(`Invalid document format for ${uri}: ${e.message}`)
		}
	}

	/**
	 * Saves raw file content directly to disk without registry savers/formatters.
	 * @param {string} uri The URI to save the file to.
	 * @param {string|Buffer} content The raw content to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveFile(uri, content) {
		this.console.debug('Saving raw file', { uri })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const path = this.location(uri)
		try {
			await this.FS.saveAsync(path, content, '.txt')
			const stat = await this.statDocument(uri)
			this.meta.set(uri, stat)
			this.data.set(uri, false)
			this.emit('change', { uri, type: 'save', data: content })
			return true
		} catch (e) {
			return false
		}
	}

	/**
	 * Saves a document to the given URI.
	 * @throws {Error} If the document cannot be saved.
	 * @param {string} uri The URI to save the document to.
	 * @param {any} document The document to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveDocument(uri, document) {
		this.console.debug('Saving document', { uri, document })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const path = this.location(uri)
		const ext = this.extname(uri)
		const saver = this.registry.resolveSaver(ext)
		try {
			const raw = saver(document, ext)
			await this.FS.saveAsync(path, raw, '.txt')
			const stat = await this.statDocument(uri)
			this.meta.set(uri, stat)
			this.data.set(uri, false)
			this.emit('change', { uri, type: 'save', data: document })
			return true
		} catch (e) {
			return false
		}
	}

	/**
	 * Appends a chunk of data to a document at the given URI.
	 * @throws {Error} If the document cannot be written.
	 * @param {string} uri The URI to write the document to.
	 * @param {string} chunk The chunk to write.
	 * @returns {Promise<boolean>} True if written successfully, false otherwise.
	 */
	async writeDocument(uri, chunk) {
		this.console.debug('Writing document', { uri, chunk })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const path = this.location(uri)
		await this.FS.appendFile(path, chunk, {
			encoding: /** @type {BufferEncoding} */ (this.encoding),
		})
		return true
	}

	/**
	 * Creates a read stream for a document at the given URI.
	 * @throws {Error} If the document cannot be read.
	 * @param {string} uri The URI to read from.
	 * @returns {Promise<any>} An asynchronous iterator or stream.
	 */
	async stream(uri) {
		this.console.debug('Streaming document', { uri })
		await this.ensureAccess(uri, 'r')
		const abs = this.location(uri)
		if (this.driver && typeof this.driver.stream === 'function') {
			return this.driver.stream(abs)
		}
		return super.stream(uri)
	}

	/**
	 * Deletes a document at the given URI.
	 * @throws {Error} If the document cannot be dropped.
	 * @param {string} uri The URI(s) of the document(s) to drop.
	 * @param {object} [options={}]
	 * @param {boolean} [options.recursive=false]
	 * @returns {Promise<boolean>} True if dropped successfully, false otherwise.
	 */
	async dropDocument(uri, options = {}) {
		const { recursive = false } = options
		this.console.debug('Deleting document', { uri, options })
		await this.ensureAccess(uri, 'd')
		const file = this.resolveSync(uri)
		let stat = await this.statDocument(uri)
		if (!stat.exists) return false
		const path = this.location(uri)
		if (stat.isDirectory) {
			if (!recursive) {
				const nested = Array.from(this.meta.keys()).filter((u) => u.startsWith(file + '/')).length
				if (nested > 0) {
					throw new Error('Directory has children, delete them first')
				}
			}
			await this.FS.rmdir(path, { recursive })
			this.meta.delete(file)
			this.data.delete(file)
			this.emit('change', { uri, type: 'drop' })
			return true
		}
		await this.FS.unlink(path)
		stat = await this.statDocument(uri)
		if (!stat.exists) {
			this.data.delete(file)
			this.meta.delete(file)
			this.emit('change', { uri, type: 'drop' })
		}
		return !stat.exists
	}

	/**
	 * Deletes a document or documents at the given URI(s).
	 * @throws {Error} If the document cannot be dropped.
	 * @param {string | string[]} uri The URI(s) of the document(s) to drop.
	 * @returns {Promise<boolean | boolean[]>} True if dropped successfully, false otherwise.
	 */
	async drop(uri) {
		if (Array.isArray(uri)) {
			const result = []
			for (const u of uri) {
				result.push(await this.dropDocument(u))
			}
			return result
		}
		return await this.dropDocument(uri)
	}
}
