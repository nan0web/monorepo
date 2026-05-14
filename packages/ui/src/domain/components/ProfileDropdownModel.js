import { Model } from '@nan0web/types'
import Navigation from '../Navigation.js'

/**
 * ProfileDropdownModel — OLMUI Model-as-Schema
 * Account/profile dropdown in the header (user menu).
 */
export class ProfileDropdownModel extends Model {
	static $id = '@nan0web/ui/ProfileDropdownModel'

	static profileName = {
		alias: 'name',
		help: 'Display name of the user',
		placeholder: 'Jane Doe',
		default: '',
	}
	static email = {
		help: 'User email address',
		placeholder: 'jane@example.com',
		default: '',
	}
	static avatar = {
		help: 'User avatar image URL',
		placeholder: 'https://...',
		default: '',
	}
	static actions = {
		help: 'Dropdown menu items (Settings, Logout, etc.)',
		type: 'Navigation[]',
		hint: Navigation,
		default: [],
	}

	/**
	 * @param {Partial<ProfileDropdownModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Display name of the user */ this.profileName
		/** @type {string} User email address */ this.email
		/** @type {string} User avatar image URL */ this.avatar
		/** @type {Navigation[]} Dropdown menu items */ this.actions
	}
}
