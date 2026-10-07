import Message from './Message.js'

/**
 * Interaction
 * 
 * Fundamental exchange or event over time.
 * Extends Message so it inherently has time, body (content), and metadata.
 *
 * @class Interaction
 * @extends Message
 */
export default class Interaction extends Message {
	/** @type {string} */
	title = ''
	/** @type {string[]} */
	tags = []

	// Using the new ModelTypes paradigm directly on the class:
	static title = { type: 'string' }
	static tags = { type: 'array', default: [] }

	constructor(input = {}) {
		super(input)
		// Since Message does not currently extend Model (yet),
		// we manually map the properties. When Message is refactored to extend Model,
		// this manual assignment can be removed.
		if (input.title !== undefined) this.title = input.title
		if (input.tags !== undefined) this.tags = input.tags
	}
}
