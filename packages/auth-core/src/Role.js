/**
 * @module Role
 * @description Role enumeration and utility class for user role handling.
 *
 * Provides a set of predefined roles and methods to create and validate role instances.
 *
 * @example
 * const role = Role.from('admin')
 * console.log(role.toString()) // 'a'
 */
import { Enum } from '@nan0web/types'

/**
 * Class representing a user role.
 *
 * @class
 */
class Role {
	/**
	 * Predefined role identifiers.
	 *
	 * @type {{ admin: string, author: string, moderator: string, user: string }}
	 */
	static ROLES = {
		admin: 'a',
		author: 'r',
		moderator: 'm',
		user: 'u',
	}
	/** @type {string} */
	value

	/**
	 * Create a Role instance.
	 *
	 * @param {object} input - Role initialization data.
	 * @param {string} input.value - Role value or name.
	 */
	constructor(input) {
		const { value = '' } = input
		// Enum validates that the provided value matches a key or value of ROLES.
		this.value = Enum(...[...Object.keys(this.ROLES), ...Object.values(this.ROLES)])(value)
		this.validateRoles()
	}
	/**
	 * Getter for static ROLES, allowing subclass overrides.
	 *
	 * @returns {{ admin: string, author: string, moderator: string, user: string }}
	 */
	get ROLES() {
		return /** @type {typeof Role} */ (this.constructor).ROLES
	}
	/**
	 * Validate that predefined role values are unique and contain no commas.
	 *
	 * @throws {TypeError} If any role value includes a comma or duplicates exist.
	 */
	validateRoles() {
		const values = Object.values(this.ROLES)
		if (values.some((v) => v.includes(','))) {
			throw new TypeError('Role must not include commas')
		}
		const set = new Set(values)
		if (set.size !== values.length) {
			throw new TypeError('All predefined roles must be unique')
		}
	}
	/**
	 * Return the raw role value as a string.
	 * @param {object} [input]
	 * @param {boolean} [input.detailed=false]
	 * @returns {string}
	 */
	toString(input = { detailed: false }) {
		const { detailed = false } = input
		if (!detailed) return this.value
		const roles = Object.fromEntries(Object.entries(this.ROLES).map(([key, value]) => [value, key]))
		return roles[this.value] ?? ''
	}
	/**
	 * Create a Role instance from a string or existing Role.
	 *
	 * @param {string|object} input - Role name, value, or an existing Role.
	 * @returns {Role}
	 */
	static from(input) {
		if (input instanceof Role) return input
		if (typeof input === 'string') {
			// If the string matches a role key, convert to its value.
			if (Object.prototype.hasOwnProperty.call(this.ROLES, input)) {
				return new this({ value: this.ROLES[input] })
			}
			// Otherwise treat it as a raw value.
			return new this({ value: input })
		}
		return new this(input)
	}
}

export default Role
