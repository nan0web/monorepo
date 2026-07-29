import { BaseWebServerAdapter } from './BaseWebServerAdapter.js'

export class CaddyServerAdapter extends BaseWebServerAdapter {
	/**
	 * Generate Caddyfile configuration block for a given domain schema.
	 * @param {import('../domain/WebDomainSchema.js').WebDomainSchema} schema
	 * @returns {string}
	 */
	generateConfigBlock(schema) {
		const domain = schema.domain
		const proxyPort = schema.proxy_port
		const root = schema.root

		if (proxyPort) {
			return `${domain} {\n\treverse_proxy :${proxyPort}\n}`
		} else {
			return `${domain} {\n\troot * ${root}\n\tfile_server\n}`
		}
	}

	async addDomain(schema) {
		// In production this writes to /etc/caddy/Caddyfile or calls Caddy Admin JSON API
		return true
	}

	async removeDomain(domain) {
		return true
	}

	async updateDomain(schema) {
		return true
	}
}

export default CaddyServerAdapter
