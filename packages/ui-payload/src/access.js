/**
 * Access control helpers for Payload CMS collections.
 */

/**
 * Creates a Payload access control function checking user presence and optional role(s).
 *
 * @example
 * // Requires any authenticated user
 * create: accessFor()
 *
 * // Requires specific role(s)
 * update: accessFor('admin', 'editor')
 * // or
 * delete: accessFor(['admin'])
 *
 * @param {...(string | string[])} roles - Allowed role(s). If none specified, checks for any authenticated user.
 * @returns {import('payload').Access} Payload Access control function
 */
export function accessFor(...roles) {
	const flatRoles = roles.flat().filter(Boolean)
	return (/** @type {any} */ { req: { user } }) => {
		if (!user) return false
		if (flatRoles.length === 0) return true
		if (Array.isArray(user.roles)) {
			return flatRoles.some((role) => user.roles.includes(role))
		}
		if (typeof user.role === 'string') {
			return flatRoles.includes(user.role)
		}
		return false
	}
}

/**
 * Shortcut alias for public read access.
 * @type {() => boolean}
 */
export const publicAccess = () => true
