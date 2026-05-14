import { Model } from '@nan0web/types'
import Navigation from '../Navigation.js'

/**
 * EmptyStateModel — OLMUI Model-as-Schema
 * Onboarding placeholder for empty tables, lists, or dashboards.
 */
export class EmptyStateModel extends Model {
	static $id = '@nan0web/ui/EmptyStateModel'

	static icon = {
		help: 'Illustration or icon name for the empty state',
		placeholder: 'inbox',
		default: '',
	}
	static title = {
		help: 'Empty state headline',
		placeholder: 'No items yet',
		default: '',
		required: true,
	}
	static description = {
		help: 'Helpful description guiding the user',
		placeholder: 'Create your first item to get started',
		default: '',
	}
	static action = {
		help: 'Primary CTA action (Navigation link or button)',
		type: 'Navigation',
		hint: Navigation,
		default: null,
	}

	/**
	 * @param {Partial<EmptyStateModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Illustration or icon name for the empty state */ this.icon
		/** @type {string} Empty state headline */ this.title
		/** @type {string} Helpful description guiding the user */ this.description
		/** @type {Navigation|null} Primary CTA action (Navigation link or button) */ this.action
	}
}
