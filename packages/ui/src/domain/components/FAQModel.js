import { Model } from '@nan0web/types'
import { AccordionModel } from './AccordionModel.js'

/**
 * FAQModel — OLMUI Model-as-Schema
 * A section containing a title and a collection of FAQ (accordion) items.
 */
export class FAQModel extends Model {
	static $id = '@nan0web/ui/FAQModel'

	static title = {
		help: 'Section title',
		placeholder: 'Frequently Asked Questions',
		default: '',
	}
	static items = {
		help: 'Array of FAQ items',
		type: 'AccordionModel[]',
		hint: AccordionModel,
		default: [],
	}

	/**
	 * @param {Partial<FAQModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Section title */ this.title
		/** @type {AccordionModel[]} Array of FAQ items */ this.items
	}
}
