import { Model } from '@nan0web/types'

export class MailServerSchema extends Model {
	static UI = {
		errorInvalidMailDomain: 'Invalid FQDN mail domain',
		errorInvalidKeySize: 'DKIM key size must be either 1024 or 2048',
	}

	static mail_domain = {
		type: 'string',
		required: true,
		validate: (v) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || MailServerSchema.UI.errorInvalidMailDomain,
	}

	static dkim_selector = {
		type: 'string',
		default: 'default',
	}

	static dkim_key_size = {
		type: 'string',
		options: ['1024', '2048'],
		default: '2048',
		validate: (v) => ['1024', '2048'].includes(String(v)) || MailServerSchema.UI.errorInvalidKeySize,
	}

	static spam_filter_active = {
		type: 'boolean',
		default: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.mail_domain
		/** @type {string} */ this.dkim_selector
		/** @type {string} */ this.dkim_key_size
		/** @type {boolean} */ this.spam_filter_active
	}
}

export default MailServerSchema
