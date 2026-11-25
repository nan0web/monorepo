import { Model } from '@nan0web/types'

export class WebDomainSchema extends Model {
	static UI = {
		errorInvalidDomain: 'Invalid FQDN domain name',
		errorInvalidPort: 'Port must be between 80 and 65535',
	}

	static domain = {
		type: 'string',
		required: true,
		validate: (v) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || WebDomainSchema.UI.errorInvalidDomain,
	}

	static root = {
		type: 'string',
		required: true,
	}

	static active = {
		type: 'boolean',
		default: true,
	}

	static ssl_provider = {
		type: 'string',
		options: ["None", "Let's Encrypt", "Self-Signed"],
		default: 'None',
	}

	static proxy_port = {
		type: 'number',
		required: false,
		validate: (v) => v === undefined || (Number.isInteger(v) && v >= 80 && v <= 65535) || WebDomainSchema.UI.errorInvalidPort,
	}

	/**
	 * @param {Partial<WebDomainSchema>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Domain FQDN */ this.domain
		/** @type {string} Document root path */ this.root
		/** @type {boolean} Whether domain is active */ this.active
		/** @type {string} SSL provider */ this.ssl_provider
		/** @type {number} Optional proxy port */ this.proxy_port
	}
}

export default WebDomainSchema
