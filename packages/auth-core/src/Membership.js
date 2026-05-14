/**
 * @module Membership
 * @description Membership class extending User to provide group-based role and permission handling.
 *
 * Allows users to join groups (memberships) with specific roles, permissions, and configuration.
 *
 * @example
 * const member = new Membership()
 * member.join('teamA', 'moderator', new Set(['r', 'w']), { dailyCoins: 10 })
 * console.log(member.can('teamA', 'w')) // true
 */
import User from './User.js'
import Role from './Role.js'

/**
 * Class representing a user's group membership with role and permissions.
 *
 * @extends User
 */
export default class Membership extends User {
	/**
	 * Map of membership keys to role, permissions, and configuration.
	 *
	 * @type {Map<string, { role: Role, perms: Set<'r'|'w'|'d'|'*'>, config: Object }>}
	 */
	memberships = new Map()

	/**
	 * Create a Membership instance.
	 *
	 * @param {object} [input={}] - Initialization data.
	 */
	constructor(input = {}) {
		super(input)
		const { memberships = [] } = input
		memberships.forEach(({ key, role, perms = new Set(), config = {} }) => {
			this.memberships.set(key, { role: Role.from(role), perms, config })
		})
	}

	/**
	 * Check if the user has a specific permission within a membership.
	 *
	 * Admin role bypasses all permission checks.
	 *
	 * @param {string} key - Membership identifier.
	 * @param {'r'|'w'|'d'|'*'} perm - Permission to verify.
	 * @returns {boolean}
	 */
	can(key, perm) {
		if (!['r', 'w', 'd', '*'].includes(perm)) {
			throw new TypeError("Permission must be one of 'r', 'w', 'd', '*'")
		}
		const mem = this.memberships.get(key)
		if (!mem) return false
		const roleVal = mem.role.value
		if ([Role.ROLES.admin, 'admin'].includes(roleVal)) return true
		return mem.perms.has(perm)
	}

	/**
	 * Add or join a membership group.
	 *
	 * @param {string} key - Membership identifier.
	 * @param {string} [roleValue='user'] - Role name or value for the membership.
	 * @param {Set<'r'|'w'|'d'|'*'>} [perms=new Set(['r'])] - Set of permissions.
	 * @param {Object} [config={}] - Additional configuration for the membership.
	 */
	join(key, roleValue = 'user', perms = new Set(['r']), config = {}) {
		this.memberships.set(key, {
			role: Role.from(roleValue),
			perms,
			config,
		})
	}

	/**
	 * Mint daily coins for a membership based on its configuration.
	 *
	 * @param {string} key - Membership identifier.
	 */
	mintDailyCoins(key) {
		const mem = this.memberships.get(key)
		if (mem?.config.dailyCoins) {
			mem.config.wallet = (mem.config.wallet || 0n) + BigInt(mem.config.dailyCoins)
		}
	}

	/**
	 * Serialize the user and memberships to a plain object.
	 *
	 * @returns {object}
	 */
	toObject() {
		return {
			...super.toObject(),
			memberships: Array.from(this.memberships.entries()).map(([k, v]) => ({
				key: k,
				...v,
			})),
		}
	}

	/**
	 * Create a Membership instance from raw data.
	 *
	 * @param {object|Membership} input - Membership data or existing instance.
	 * @returns {Membership}
	 */
	static from(input) {
		if (input instanceof Membership) return input
		return new Membership(input)
	}
}
