import { Model } from '@nan0web/types'

/**
 * AccordionModel — OLMUI Model-as-Schema
 * Collapsible FAQ / accordion item with title + content.
 */
export class AccordionModel extends Model {
	static $id = '@nan0web/ui/AccordionModel'

	static title = {
		help: 'Accordion item header / question',
		placeholder: 'How does it work?',
		default: '',
		required: true,
	}
	static content = {
		help: 'Accordion item body / answer (supports markdown)',
		placeholder: 'It works by...',
		default: '',
		required: true,
	}
	static open = {
		help: 'Whether the item is expanded by default',
		default: false,
		type: 'boolean',
	}

	/**
	 * @param {Partial<AccordionModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Accordion item header / question */ this.title
		/** @type {string} Accordion item body / answer (supports markdown) */ this.content
		/** @type {boolean} Whether the item is expanded by default */ this.open
	}
}
