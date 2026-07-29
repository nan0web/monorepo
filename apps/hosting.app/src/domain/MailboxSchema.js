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

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.domain
		/** @type {string} */ this.mailbox_username
		/** @type {string} */ this.mailbox_password
		/** @type {bigint} */ this.quota_bytes
		/** @type {string} */ this.forward_to
	}
}

export default MailboxSchema
