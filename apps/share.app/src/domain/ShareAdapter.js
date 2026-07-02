import { Model, createConfig } from './Models.js'

export class NotImplementedError extends Error {
	constructor(method) {
		super(`Method '${method}' must be implemented by the adapter`)
		this.name = 'NotImplementedError'
	}
}

/**
 * Base abstract class for all publication adapters.
 */
export class ShareAdapter extends Model {
	/**
	 * @param {any} [data]
	 * @param {any} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.config = createConfig(data)
	}

	/**
	 * Unique identifier of the adapter instance/platform (e.g. 'youtube', 'etsy').
	 * @returns {string}
	 */
	get id() {
		throw new NotImplementedError('id')
	}

	/**
	 * Declared capabilities of this adapter.
	 * @returns {import('./Capability.js').Capability[]|string[]}
	 */
	get capabilities() {
		return []
	}

	/**
	 * Verifies connection/credentials for the platform.
	 * @returns {Promise<boolean>}
	 */
	async verify() {
		throw new NotImplementedError('verify')
	}

	/**
	 * Publishes content on the platform.
	 * @param {any} content
	 * @returns {Promise<any>}
	 */
	async publish(content) {
		throw new NotImplementedError('publish')
	}
}
