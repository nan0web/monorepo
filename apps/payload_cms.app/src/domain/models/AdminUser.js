import { Model } from '@nan0web/types'

export class AdminUser extends Model {
	static $auth = true
	
	static $collection = 'admin_users'
	
	static UI = {
		$singular: 'Admin User',
		$plural: 'Admin Users',
		$group: 'System'
	}

	static role = {
		help: 'Admin User role',
		type: 'enum',
		options: ['admin', 'editor', 'viewer'],
		default: 'viewer',
		required: true,
	}

	/**
	 * @param {Partial<AdminUser>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Role */ this.role
	}
}
