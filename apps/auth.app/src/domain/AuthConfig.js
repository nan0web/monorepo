import { Model } from '@nan0web/types'

/**
 * AuthConfig — Model-as-Schema for Authentication System Settings.
 * Defines the operational environment for AuthApp.
 */
export class AuthConfig extends Model {
	static UI = {
		title: 'Auth System Settings',
		description: 'Security and lifecycle parameters',
		icon: '⚙️',
	}

	static passwordMinLength = {
		alias: 'password-min-length',
		help: 'Minimum required length for new passwords',
		type: 'number',
		default: 8,
		validate: (v) => v >= 4 || 'Password length should be at least 4 chars',
	}

	static allowPublicSignup = {
		alias: 'allow-public-signup',
		help: 'Whether users can self-register or remain admin-only',
		type: 'boolean',
		default: true,
	}

	static clearTokensOnPasswordReset = {
		alias: 'clear-tokens-on-password-reset',
		help: 'Whether to invalidate all existing sessions when password changes',
		type: 'boolean',
		default: true,
	}

	static tokenExpiry = {
		alias: 'token-expiry',
		help: 'Duration before access tokens expire (e.g. 1h, 1d)',
		type: 'string',
		default: '1h',
	}

	static verificationFlow = {
		alias: 'verification-flow',
		help: 'Strategy for verifying new accounts: email-only, admin-only, or email+admin',
		type: 'string',
		options: ['email-only', 'admin-only', 'email+admin'],
		default: 'email-only',
	}

	static defaultCommunityCoins = {
		alias: 'default-community-coins',
		help: 'Starting balance for new registrations (Move to sun.app soon)',
		type: 'number',
		default: 0,
	}

	/**
	 * @param {Partial<AuthConfig> | Record<string, any>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} */ this.passwordMinLength
		/** @type {boolean} */ this.allowPublicSignup
		/** @type {boolean} */ this.clearTokensOnPasswordReset
		/** @type {string} */ this.tokenExpiry
		/** @type {'email-only'|'admin-only'|'email+admin'} */ this.verificationFlow
		/** @type {number} */ this.defaultCommunityCoins
	}
}
