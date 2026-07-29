import { Model } from '@nan0web/types'

export class AddressModel extends Model {
	static street = { type: 'string', help: 'Street address' }
	static city = { type: 'string', help: 'City' }
	static zip = { type: 'string', help: 'ZIP code' }

	/**
	 * @param {Partial<AddressModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Street name */ this.street
		/** @type {string} City name */ this.city
		/** @type {string} ZIP code */ this.zip
	}
}

export class ComplexModel extends Model {
	static fullName = { type: 'string', help: 'Full Name', placeholder: 'John Doe' }
	static age = { type: 'number', help: 'Age', placeholder: '25' }
	static birthDate = { type: 'date', help: 'Date of Birth' }
	static bio = {
		type: 'markdown',
		help: 'Short Biography',
		placeholder: 'Tell us about yourself...',
	}
	static role = {
		type: 'select',
		help: 'User Role',
		options: ['Admin', 'Editor', 'Viewer'],
		default: 'Viewer',
	}
	static notifications = { type: 'boolean', help: 'Enable notifications' }
	static address = { type: 'model', model: AddressModel, help: 'Primary Address' }

	/**
	 * @param {Partial<ComplexModel>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Full name */ this.fullName
		/** @type {number} Age */ this.age
		/** @type {string} Date of birth */ this.birthDate
		/** @type {string} Short biography */ this.bio
		/** @type {string} User role */ this.role
		/** @type {boolean} Enable notifications */ this.notifications
		/** @type {AddressModel} Primary address */ this.address
	}
}
