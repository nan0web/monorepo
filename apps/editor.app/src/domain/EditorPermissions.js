import { Model } from '@nan0web/ui'

/**
 * EditorPermissions — Immutable object defining what a user can do.
 * Derived from EditorConfig and Auth Session.
 */
export class EditorPermissions extends Model {
	static isAuthenticated = { type: 'boolean', default: false }
	static canEdit = { type: 'boolean', default: true }
	static canDelete = { type: 'boolean', default: false }
	static canManageUsers = { type: 'boolean', default: false }
	static canCommit = { type: 'boolean', default: false }

	constructor(data = {}, options = {}) {
		super(data, options)
		this.isAuthenticated = data.isAuthenticated ?? false
		this.canEdit = data.canEdit ?? true
		this.canDelete = data.canDelete ?? false
		this.canManageUsers = data.canManageUsers ?? false
		this.canCommit = data.canCommit ?? false
	}

	/**
	 * Перевірка наявності ролі адміністратора.
	 * @param {string[]} roles
	 * @returns {boolean}
	 */
	static isAdmin(roles = []) {
		return roles.includes('admin') || roles.includes('root')
	}

	/**
	 * Перевірка наявності дозволу на конкретну дію.
	 * @param {'edit'|'delete'|'manageUsers'|'commit'} action
	 * @returns {boolean}
	 */
	allows(action) {
		if (action === 'edit') return this.canEdit
		if (action === 'delete') return this.canDelete
		if (action === 'manageUsers') return this.canManageUsers
		if (action === 'commit') return this.canCommit
		return false
	}

	/**
	 * Стандартний набір дозволів для гостя (Sandbox mode).
	 */
	static guest() {
		return new EditorPermissions({
			isAuthenticated: false,
			canEdit: true, // Локально в Sandbox
			canDelete: false,
			canManageUsers: false,
			canCommit: false
		})
	}

	/**
	 * Повний доступ (Адміністратор).
	 */
	static fullAccess() {
		return new EditorPermissions({
			isAuthenticated: true,
			canEdit: true,
			canDelete: true,
			canManageUsers: true,
			canCommit: true
		})
	}
}
