import { Model } from '@nan0web/types'

/**
 * @typedef {'jwt'|'session'|'apikey'} AuthStrategy
 */

/**
 * AuthPolicy — Model-as-Schema for access control policy.
 *
 * Defines how auth.app guards protected endpoints.
 * This model does NOT handle rendering — it only describes
 * the authorization rules that the API middleware enforces.
 *
 * Separation of concerns (#27-28):
 *   - AuthPolicy → returns 401/403 (knows nothing about UI)
 *   - UI Adapter → intercepts 401/403 and shows login/popup
 *
 * @see user-stories.md
 *
 * @property {boolean} enabled Whether auth enforcement is active
 * @property {string[]} protectedPaths URL patterns requiring authentication
 * @property {string[]} publicPaths URL patterns always accessible without auth
 * @property {string} loginRedirect Path to redirect on 401
 * @property {'jwt'|'session'|'apikey'} strategy Authentication strategy
 * @property {string} tokenHeader HTTP header name for token (default: Authorization)
 */
export class AuthPolicy extends Model {
	static UI = {
		title: 'Auth Policy',
		description: 'Access control rules for protected API endpoints',
		icon: '🔐',
	}

	static enabled = {
		help: 'Whether authentication enforcement is active',
		type: 'boolean',
		default: true,
	}

	static protectedPaths = {
		help: 'URL patterns requiring authentication (glob syntax)',
		type: 'string[]',
		default: ['/api/**'],
	}

	static publicPaths = {
		help: 'URL patterns always accessible without auth (overrides protected)',
		type: 'string[]',
		default: ['/api/health', '/api/status'],
	}

	static loginRedirect = {
		help: 'Client-side redirect path on 401 (UI adapter responsibility)',
		type: 'string',
		default: '/login',
	}

	static strategy = {
		help: 'Authentication strategy to apply',
		type: 'enum',
		/** @type {AuthStrategy[]} */
		options: ['jwt', 'session', 'apikey'],
		/** @type {AuthStrategy} */
		default: 'jwt',
	}

	static tokenHeader = {
		help: 'HTTP header name for authentication token',
		type: 'string',
		default: 'Authorization',
		hidden: true,
	}

	/**
	 * @param {Partial<AuthPolicy> | Record<string, any>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Whether auth enforcement is active */ this.enabled
		/** @type {string} Client-side redirect path on 401 (UI adapter responsibility) */ this.loginRedirect
		/** @type {AuthStrategy} Authentication strategy to apply */ this.strategy
		/** @type {string} HTTP header name for authentication token */ this.tokenHeader
		/** @type {string[]} URL patterns requiring authentication (glob syntax) */ this.protectedPaths
		/** @type {string[]} URL patterns always accessible without auth (overrides protected) */ this.publicPaths
	}

	/**
	 * Check if a given URL path is protected by this policy.
	 * Public paths override protected paths.
	 *
	 * @param {string} urlPath
	 * @returns {boolean} true if path requires authentication
	 */
	isProtected(urlPath) {
		// Public paths = always accessible
		if (this.#matchesAny(urlPath, this.publicPaths)) return false
		// Protected paths = require auth
		return this.#matchesAny(urlPath, this.protectedPaths)
	}

	/**
	 * Simple glob matching (** = any depth, * = single segment).
	 * @param {string} urlPath
	 * @param {string[]} patterns
	 * @returns {boolean}
	 */
	#matchesAny(urlPath, patterns) {
		if (!Array.isArray(patterns)) return false
		return patterns.some((pattern) => {
			const regex = pattern
				.replace(/\*\*/g, '___GLOBSTAR___')
				.replace(/\*/g, '[^/]+')
				.replace(/___GLOBSTAR___/g, '.*')
			return new RegExp(`^${regex}$`).test(urlPath)
		})
	}
}
