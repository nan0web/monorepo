import { BaseWebServerAdapter } from './BaseWebServerAdapter.js'

/**
 * CaddyServerAdapter generates Caddyfile blocks and _registry.caddy from active sites.
 */
export class CaddyServerAdapter extends BaseWebServerAdapter {
	/**
	 * Generate Caddyfile configuration block for a domain or site schema.
	 * @param {object} schema
	 * @returns {string}
	 */
	generateConfigBlock(schema) {
		const domain = schema.domain
		const proxyPort = schema.port ?? schema.proxy_port
		const ssl = schema.ssl ?? schema.ssl_provider
		const localSnippet = schema.localSnippet || 'local_dev'
		const root = schema.root

		if (proxyPort) {
			if (ssl === 'local') {
				return `${domain} {\n\timport ${localSnippet}\n\treverse_proxy 127.0.0.1:${proxyPort}\n}`
			}
			return `${domain} {\n\treverse_proxy :${proxyPort}\n}`
		}
		return `${domain} {\n\troot * ${root}\n\tfile_server\n}`
	}

	/**
	 * Check if a domain is already configured in manual .caddy file contents.
	 * @param {string} domain
	 * @param {string[]} manualContents
	 * @returns {boolean}
	 */
	isConfiguredManually(domain, manualContents = []) {
		const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const pattern = new RegExp(`^\\s*${escaped}(\\s*\\{|\\s*,)`, 'm')
		return manualContents.some((content) => pattern.test(content))
	}

	/**
	 * Build full _registry.caddy content from active SiteConfig items.
	 * @param {Array<object>} sites
	 * @param {object} [options]
	 * @param {string} [options.localSnippet]
	 * @param {string[]} [options.manualContents]
	 * @returns {string}
	 */
	generateRegistry(sites = [], options = {}) {
		const localSnippet = options.localSnippet || 'local_dev'
		const manualContents = options.manualContents || []
		const lines = ['# Auto-generated from sites-enabled/*.nan0 by nan0host. Do not edit manually.', '']

		for (const site of sites) {
			if (!site.domain || !site.port) continue
			if (this.isConfiguredManually(site.domain, manualContents)) continue
			lines.push(this.generateConfigBlock({ ...site, localSnippet }), '')
		}

		return lines.join('\n')
	}
}

export default CaddyServerAdapter
