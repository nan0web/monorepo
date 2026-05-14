import { Model } from '@nan0web/types'

/**
 * UserAccount — Model-as-Schema for User Identity and Profile.
 * Represents the "Who" in the OLMUI ecosystem.
 */
export class UserAccount extends Model {
	static UI = {
		title: 'User Profile',
		description: 'Personal identity and community status',
		icon: '👤',
	}

	static username = {
		help: 'Unique identifier for the user',
		type: 'string',
		required: true,
	}

	static email = {
		help: 'Primary contact email',
		type: 'string',
		required: true,
		errorInvalid: 'Invalid email format',
		validate: (v) => v.includes('@') || UserAccount.email.errorInvalid,
	}

	static avatar = {
		help: 'URL to profile picture',
		type: 'string',
		default: '',
	}

	static verified = {
		help: 'Whether the email has been confirmed',
		type: 'boolean',
		default: false,
		readOnly: true,
	}

	static soulId = {
		help: 'Sovereign Did/Soul ID for decentralized identity',
		alias: 'soul-id',
		type: 'string',
		default: '',
	}

	static approved = {
		help: 'Whether the user has been authorized by an administrator',
		type: 'boolean',
		default: false,
	}

	/**
	 * @param {Partial<UserAccount> | Record<string, any>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.username
		/** @type {string} */ this.email
		/** @type {string} */ this.avatar
		/** @type {boolean} */ this.verified
		/** @type {string} */ this.soulId
		/** @type {boolean} */ this.approved
	}
}
