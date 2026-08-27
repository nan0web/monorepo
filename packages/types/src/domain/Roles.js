/**
 * System Roles Constants
 */
export const ROLES = Object.freeze({
	ADMIN: 'admin',
	MANAGER: 'manager',
	USER: 'user',
	PUBLIC: 'public',
})

/**
 * Standard Access Control Presets for Model-as-Schema
 */
export const DEFAULT_ACCESS = Object.freeze({
	read: true,
	create: [ROLES.ADMIN, ROLES.MANAGER],
	update: [ROLES.ADMIN, ROLES.MANAGER],
	delete: [ROLES.ADMIN],
})
