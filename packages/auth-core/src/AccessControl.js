/**
 * @module AccessControl
 * @description Universal, pure access control resolver.
 *
 * Data-driven authorization based on plain-text rule files:
 *   .access — global rules (subject rights path)
 *   .group  — group membership (group user1 user2 ...)
 *
 * Three-level resolution: user-specific → group → global (*).
 * Zero I/O — accepts raw content strings, delegates file reading to consumers.
 *
 * @example
 * const ac = new AccessControl()
 * ac.load(
 *   '* r /public\nadmin rwd /admin',
 *   'admin sovr\nmembers sovr artem'
 * )
 * ac.check('sovr', '/admin', 'r')  // true
 * ac.check('artem', '/admin', 'r') // false
 * ac.check('guest', '/public', 'r') // true
 */

/**
 * @typedef {{ subject: string, access: string, target: string }} AccessRule
 */

/**
 * Pure access control resolver.
 * No I/O — accepts raw content strings via load().
 */
export default class AccessControl {
	static ANY = '*'
	static READ = 'r'
	static WRITE = 'w'
	static DELETE = 'd'

	/** @type {AccessRule[]} */
	#rules = []

	/** @type {Map<string, string[]>} group → [usernames] */
	#groups = new Map()

	/**
	 * Load rules and groups from raw content strings.
	 * Call once before check/info/filterNav.
	 *
	 * @param {string} accessContent - raw .access file content
	 * @param {string} groupContent  - raw .group file content
	 */
	load(accessContent, groupContent) {
		this.#rules = this.#parseAccessFile(accessContent)
		this.#groups = this.#parseGroupFile(groupContent)
	}

	/**
	 * Check if a user has access to a path at a given level.
	 *
	 * Resolution order:
	 *   1. Group rules (user belongs to group → group has matching rule)
	 *   2. Global rules (subject = *)
	 *
	 * @param {string} username - user identifier (e.g. email slug)
	 * @param {string} path - URL path (e.g. "/admin")
	 * @param {string} [level='r'] - 'r' | 'w' | 'd'
	 * @returns {boolean}
	 */
	check(username, path, level = 'r') {
		if (!path.startsWith('/')) path = `/${path}`

		// 1. User rules (subject === username)
		const userRules = this.#rules.filter((r) => r.subject === username)
		if (this.#matchAccess(userRules, path, level)) return true

		// 2. Group rules
		const userGroups = this.#getUserGroups(username)
		const groupRules = this.#rules.filter((r) => userGroups.includes(r.subject))
		if (this.#matchAccess(groupRules, path, level)) return true

		// 3. Global rules (*)
		const globalRules = this.#rules.filter((r) => r.subject === AccessControl.ANY)
		return this.#matchAccess(globalRules, path, level)
	}

	/**
	 * Get access summary for a user: their effective rules and group memberships.
	 *
	 * @param {string} username
	 * @returns {{ rules: AccessRule[], groups: string[] }}
	 */
	info(username) {
		const groups = this.#getUserGroups(username)
		const userRules = this.#rules.filter((r) => r.subject === username)
		const groupRules = this.#rules.filter((r) => groups.includes(r.subject))
		const globalRules = this.#rules.filter((r) => r.subject === AccessControl.ANY)
		return {
			rules: [...userRules, ...groupRules, ...globalRules],
			groups,
		}
	}

	/**
	 * Filter navigation items to only those the user can access.
	 *
	 * Items with `guest: true` are shown only when username is null (not logged in).
	 * All other items are filtered by access rules.
	 *
	 * @param {Array<{path: string, guest?: boolean}>} navItems
	 * @param {string|null} username - null = guest (not logged in)
	 * @returns {Array<{path: string, guest?: boolean}>}
	 */
	filterNav(navItems, username) {
		return navItems.filter((item) => {
			// Guest-only items (e.g. login, register) — hide when logged in
			if (item.guest && username) return false

			// Logged-in user — full access check
			if (username) return this.check(username, item.path, 'r')

			// Guest (not logged in, no username)
			if (item.guest) return true

			// Non-guest items for guests — check if * has access (public items)
			const globalRules = this.#rules.filter((r) => r.subject === AccessControl.ANY)
			return this.#matchAccess(globalRules, item.path, 'r')
		})
	}

	// ─── Private ──────────────────────────────────────

	/**
	 * @param {string} username
	 * @returns {string[]}
	 */
	#getUserGroups(username) {
		const groups = []
		for (const [group, members] of this.#groups) {
			if (members.includes(username)) groups.push(group)
		}
		return groups
	}

	/**
	 * @param {AccessRule[]} rules
	 * @param {string} path
	 * @param {string} level
	 * @returns {boolean}
	 */
	#matchAccess(rules, path, level) {
		return rules.some((rule) => {
			if (!rule?.target) return false
			const accessMatch = rule.access.includes(level)
			let target = rule.target.startsWith('/') ? rule.target : `/${rule.target}`
			// Strip trailing slash for consistent matching except for root
			if (target.length > 1 && target.endsWith('/')) target = target.slice(0, -1)

			const pathMatch =
				target === '/' ? path.startsWith('/') : path === target || path.startsWith(target + '/')

			return accessMatch && pathMatch
		})
	}

	/**
	 * Parse raw .access file content into structured rules.
	 * Format: subject  rights  path (space-separated, # = comment)
	 *
	 * @param {string} content
	 * @returns {AccessRule[]}
	 */
	#parseAccessFile(content) {
		if (!content) return []
		return content
			.split('\n')
			.filter((line) => line.trim() && !line.startsWith('#'))
			.map((line) => {
				const [subject, access, ...targetParts] = line.trim().split(/\s+/)
				const target = targetParts.join(' ')
				return { subject, access, target }
			})
			.filter((r) => r.subject && r.access && r.target)
	}

	/**
	 * Parse raw .group file content into a Map.
	 * Format: groupname  user1 user2 ... (space-separated, # = comment)
	 *
	 * @param {string} content
	 * @returns {Map<string, string[]>}
	 */
	#parseGroupFile(content) {
		const groups = new Map()
		if (!content) return groups
		for (const line of content.split('\n')) {
			if (!line.trim() || line.startsWith('#')) continue
			const [group, ...users] = line.trim().split(/\s+/)
			if (group && users.length > 0) groups.set(group, users)
		}
		return groups
	}
}
