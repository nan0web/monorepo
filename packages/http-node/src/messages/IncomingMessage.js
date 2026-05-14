import { IncomingMessage as HttpIncomingMessage } from 'node:http'

/**
 * Extended HTTP Incoming Message class for Node.js environment
 * @extends {HttpIncomingMessage}
 */
class IncomingMessage extends HttpIncomingMessage {
	/**
	 * Creates a new IncomingMessage instance
	 * @param {import('node:net').Socket} socket - The socket
	 * @param {Object} [options={}] - Options
	 */
	constructor(socket, options = {}) {
		super(socket)
		this.params = {}
		// Explicitly set for test compatibility (parser sets in real usage)
		this.method = options.method || this.method || 'GET'
		this.url = options.url || this.url || '/'
		if (options.headers) {
			Object.assign(this.headers, options.headers)
		}
	}

	/**
	 * Lazy-parsed query parameters from the URL
	 * @type {Record<string, string>}
	 */
	get query() {
		if (this._query) return this._query
		try {
			const url = new URL(this.url || '/', `http://${this.headers.host || 'localhost'}`)
			this._query = Object.fromEntries(url.searchParams)
		} catch (e) {
			this._query = {}
		}
		return this._query
	}

	/**
	 * Implements Readable stream _read method
	 */
	_read() {
		// This method is required for Readable streams but not used in this context
		// since we're not directly pushing data to the stream
	}
}

export default IncomingMessage
