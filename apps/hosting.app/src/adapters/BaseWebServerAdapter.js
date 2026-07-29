export class BaseWebServerAdapter {
	/**
	 * @param {import('../domain/WebDomainSchema.js').WebDomainSchema} schema
	 * @returns {Promise<boolean>}
	 */
	async addDomain(schema) {
		throw new Error('Not implemented')
	}

	/**
	 * @param {string} domain
	 * @returns {Promise<boolean>}
	 */
	async removeDomain(domain) {
		throw new Error('Not implemented')
	}

	/**
	 * @param {import('../domain/WebDomainSchema.js').WebDomainSchema} schema
	 * @returns {Promise<boolean>}
	 */
	async updateDomain(schema) {
		throw new Error('Not implemented')
	}
}

export default BaseWebServerAdapter
