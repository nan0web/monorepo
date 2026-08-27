/**
 * @file DBServer - HTTP server exposing @nan0web/db via REST API.
 *
 * Routes:
 *   GET    /api/documents/:uri       - read document
 *   POST   /api/documents            - create/save document
 *   PUT    /api/documents/:uri       - write/update document
 *   DELETE /api/documents/:uri       - delete document
 *   GET    /api/directory/:path      - list directory
 *   GET    /api/stat/:uri            - document statistics
 *   GET    /health                   - health check
 */
import { Server } from '@nan0web/http-node/server'
import { bodyParser } from '@nan0web/http-node/middlewares'
import { NoConsole } from '@nan0web/log'
import { renderExplorerHTML } from './renderExplorerHTML.js'

/**
 * @typedef {import('@nan0web/http-node').IncomingMessage & { params: Record<string, string>, body?: any }} ServerRequest
 * @typedef {import('node:http').ServerResponse & import('@nan0web/http-node').ServerResponse} ServerResponse
 */

/**
 * DBServer - wraps @nan0web/http-node/Server and mounts DB routes.
 *
 * @param {Object} [options]
 * @param {import('@nan0web/db').DB} options.db - database instance
 * @param {number} [options.port=3456] - listen port
 * @param {string} [options.host='0.0.0.0'] - listen host
 * @param {import('@nan0web/log').ConsoleLike} [options.logger=console] - logger
 */
export default class DBServer {
	/** @type {import('@nan0web/http-node/server').Server} */
	server

	/** @type {import('@nan0web/db').DB} */
	db

	/** @type {number} */
	port

	/** @type {string} */
	host

	/** @type {import('@nan0web/log').ConsoleLike} */
	logger

	/** @type {any} */
	model

	/**
	 * @param {{ db: import('@nan0web/db').DB, port?: number, host?: string, logger?: import('@nan0web/log').ConsoleLike, model?: any }} input
	 */
	constructor(input) {
		const { db, port = 3456, host = '0.0.0.0', logger, model } = input || {}

		if (!db) {
			throw new TypeError('DBServer requires a db instance')
		}

		this.db = db
		this.port = Number(port)
		this.host = String(host)
		this.logger = logger || new NoConsole()
		this.model = model

		this.server = new Server({
			port: this.port,
			host: this.host,
			logger: /** @type {Console} */ (this.logger),
			middlewares: [bodyParser()],
		})

		this.#mountRoutes()
	}

	/**
	 * Mount all REST routes on the underlying HTTP server.
	 */
	#mountRoutes() {
		const s = this.server

		// Health
		s.get(
			'/health',
			/** @type {any} */ (
				async (req, res) => {
					res.setHeader('Content-Type', 'application/json')
					res.end(JSON.stringify({ status: 'ok', service: 'db-server' }), 'utf8')
				}
			)
		)

		// Web File Explorer UI (Midnight Commander Dual/Split Style)
		const handleExplorerUI = /** @type {any} */ (async (_req, res) => {
			res.setHeader('Content-Type', 'text/html; charset=utf-8')
			res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
			res.setHeader('Pragma', 'no-cache')
			res.setHeader('Expires', '0')
			res.end(renderExplorerHTML({ model: this.model }), 'utf8')
		})

		s.get('/', handleExplorerUI)
		s.get('/explorer', handleExplorerUI)

		// API Documentation & Help Endpoint
		const apiDocs = {
			openapi: '3.0.0',
			info: {
				title: '@nan0web/db-server REST API',
				version: '3.4.0',
				description: 'High-performance HTTP REST interface for @nan0web/db document store and file system',
			},
			endpoints: [
				{ method: 'GET', path: '/health', description: 'Health check endpoint' },
				{ method: 'GET', path: '/api/help', description: 'OpenAPI documentation and API endpoints listing' },
				{ method: 'GET', path: '/api/documents/:uri', description: 'Fetch document by URI path (supports wildcard /api/documents/*)' },
				{ method: 'POST', path: '/api/documents', description: 'Create or update document with JSON body: { uri, document }' },
				{ method: 'PUT', path: '/api/documents/:uri', description: 'Save document content at specified URI' },
				{ method: 'DELETE', path: '/api/documents/:uri', description: 'Remove document at specified URI' },
				{ method: 'GET', path: '/api/directory/:path', description: 'List directory contents for specified path' },
				{ method: 'GET', path: '/api/stat/:uri', description: 'Get document or folder statistics (size, modified time, isFile, etc.)' },
			],
		}

		const handleHelp = /** @type {any} */ (async (_req, res) => {
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify(apiDocs, null, 2), 'utf8')
		})

		s.get('/api', handleHelp)
		s.get('/api/help', handleHelp)

		// Read document (exact match for simple filenames)
		s.get(
			'/api/documents/:uri',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params.uri
						const mode = req.query?.mode === 'get' ? 'get' : 'fetch'
						const doc = await this.db[mode](uri)
						if (doc === undefined) {
							res.statusCode = 404
							res.setHeader('Content-Type', 'application/json')
							res.end(JSON.stringify({ error: 'Not found', uri }), 'utf8')
							return
						}
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(doc), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/documents/:uri', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Read document (wildcard for nested URIs like test/doc.json)
		s.get(
			'/api/documents/*',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params['0']
						const mode = req.query?.mode === 'get' ? 'get' : 'fetch'
						const doc = await this.db[mode](uri)
						if (doc === undefined) {
							res.statusCode = 404
							res.setHeader('Content-Type', 'application/json')
							res.end(JSON.stringify({ error: 'Not found', uri }), 'utf8')
							return
						}
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(doc), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/documents/*', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Create / save document
		s.post(
			'/api/documents',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const body = req.body ?? {}
						const uri = body.uri
						const document = body.document

						if (!uri) {
							res.statusCode = 400
							res.setHeader('Content-Type', 'application/json')
							res.end(JSON.stringify({ error: 'Missing "uri" field' }), 'utf8')
							return
						}
						if (document === undefined) {
							res.statusCode = 400
							res.setHeader('Content-Type', 'application/json')
							res.end(JSON.stringify({ error: 'Missing "document" field' }), 'utf8')
							return
						}

						await this.db.saveDocument(uri, document)
						res.statusCode = 201
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ ok: true, uri }), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] POST /api/documents', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Write / update document (exact match for simple filenames)
		s.put(
			'/api/documents/:uri',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params.uri
						const document = req.body ?? {}

						const ok = await this.db.saveDocument(uri, document)
						if (!ok) throw new Error('saveDocument returned false')
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ ok: true, uri }), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] PUT /api/documents/:uri', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Write / update document (wildcard for nested URIs)
		s.put(
			'/api/documents/*',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params['0']
						const document = req.body ?? {}

						const ok = await this.db.saveDocument(uri, document)
						if (!ok) throw new Error('saveDocument returned false')
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ ok: true, uri }), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] PUT /api/documents/*', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Delete document (exact match for simple filenames)
		s.delete(
			'/api/documents/:uri',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params.uri
						const ok = await this.db.dropDocument(uri)
						if (!ok) throw new Error('dropDocument returned false')
						res.statusCode = 204
						res.end('')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] DELETE /api/documents/:uri', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Delete document (wildcard for nested URIs)
		s.delete(
			'/api/documents/*',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params['0']
						const ok = await this.db.dropDocument(uri)
						if (!ok) throw new Error('dropDocument returned false')
						res.statusCode = 204
						res.end('')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] DELETE /api/documents/*', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// List directory (exact match)
		s.get(
			'/api/directory/:path',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const rawPath = req.params.path === '.' ? '' : req.params.path
						const path = decodeURIComponent(rawPath)
						const entries = await this.db.listDir(path)
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(entries), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/directory/:path', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// List directory (wildcard for nested paths)
		s.get(
			'/api/directory/*',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const rawPath = req.params['0'] || ''
						const path = rawPath.split('/').map(p => decodeURIComponent(p)).join('/')
						const entries = await this.db.listDir(path)
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(entries), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/directory/*', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Document stat (exact match for simple filenames)
		s.get(
			'/api/stat/:uri',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params.uri
						const stat = await this.db.stat(uri)
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(stat), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/stat/:uri', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)

		// Document stat (wildcard for nested URIs)
		s.get(
			'/api/stat/*',
			/** @type {any} */ (
				async (
					/** @type {ServerRequest} */ req,
					/** @type {ServerResponse} */ res
				) => {
					try {
						const uri = req.params['0']
						const stat = await this.db.stat(uri)
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(stat), 'utf8')
					} catch (/** @type {any} */ err) {
						this.logger.error('[db-server] GET /api/stat/*', err.message)
						res.statusCode = 500
						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify({ error: err.message }), 'utf8')
					}
				}
			)
		)
	}

	/**
	 * Start listening.
	 * @returns {Promise<DBServer>}
	 */
	async listen() {
		await this.server.listen()
		this.logger.info(`[db-server] listening on ${this.host}:${this.server.port}`)
		return this
	}

	/**
	 * Stop the server.
	 * @returns {Promise<void>}
	 */
	async close() {
		await this.server.close()
	}

	/**
	 * Factory: create + start in one call.
	 * @param {{ db: import('@nan0web/db').DB, port?: number, host?: string, logger?: import('@nan0web/log').ConsoleLike }} input
	 * @returns {Promise<DBServer>}
	 */
	static async create(input) {
		const srv = new DBServer(input)
		await srv.listen()
		return srv
	}
}
