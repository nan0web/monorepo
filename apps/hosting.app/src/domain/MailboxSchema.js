import { Model } from '@nan0web/types'

export class MailboxSchema extends Model {
	static UI = {
		errorInvalidDomain: 'Invalid FQDN domain',
		errorShortPassword: 'Password must be at least 8 characters long',
		errorInvalidForward: 'Invalid forwarding email address',
	}

	static domain = {
		type: 'string',
		required: true,
		validate: (v) => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || MailboxSchema.UI.errorInvalidDomain,
	}

	static mailbox_username = {
		type: 'string',
		required: true,
	}

	static mailbox_password = {
		type: 'string',
		required: true,
		validate: (v) => (typeof v === 'string' && v.length >= 8) || MailboxSchema.UI.errorShortPassword,
	}

	static quota_bytes = {
		type: 'bigint',
		default: 1073741824n, // 1GB in bytes
	}

	static forward_to = {
		type: 'string',
		required: false,
		validate: (v) => v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || MailboxSchema.UI.errorInvalidForward,
	}

	/**
	 * @param {Partial<MailboxSchema>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Domain FQDN */ this.domain
		/** @type {string} Mailbox username */ this.mailbox_username
		/** @type {string} Mailbox password */ this.mailbox_password
		/** @type {bigint} Storage quota in bytes */ this.quota_bytes
		/** @type {string} Optional forwarding email */ this.forward_to
	}
}

export default MailboxSchema
