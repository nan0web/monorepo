import Interaction from './Interaction.js'

/**
 * Event
 * 
 * An interaction that is bound to a specific location and start time.
 *
 * @class Event
 * @extends Interaction
 */
export default class Event extends Interaction {
	/** @type {string} */
	starts_at = ''
	/** @type {string} */
	location = ''

	static starts_at = { type: 'string' }
	static location = { type: 'string' }

	constructor(input = {}) {
		super(input)
		if (input.starts_at !== undefined) this.starts_at = input.starts_at
		if (input.location !== undefined) this.location = input.location
	}
}
