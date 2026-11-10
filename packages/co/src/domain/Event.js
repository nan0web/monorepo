import Interaction from './Interaction.js'
import Contact from './Contact.js'

/**
 * Event
 * 
 * Space-time ontology model (location, branch, event, milestone, hearing).
 *
 * @class Event
 * @extends Interaction
 */
export default class Event extends Interaction {
	static id = { type: 'string', help: 'Unique slug or ID' }
	static type = {
		type: 'string',
		help: 'Space-time entity type',
		default: 'event',
		validate: (val) =>
			['location', 'branch', 'event', 'milestone', 'hearing'].includes(val) ||
			'Type must be location, branch, event, milestone, or hearing',
	}
	static title = { type: 'string', help: 'Title or event name', default: '' }
	static location = { type: 'string', help: 'Physical address or URL', default: '' }
	static coordinates = { type: 'object', help: 'Coordinates { lat, lng }', default: {} }
	static starts_at = { type: 'date', help: 'Start date or schedule timestamp' }
	static ends_at = { type: 'date', help: 'End date or schedule timestamp' }
	static contacts = { type: 'array', help: 'Array of contacts (Contact[])', default: [] }

	/**
	 * @param {Record<string, any>} [input]
	 */
	constructor(input = {}) {
		super(input)
		const raw = typeof input === 'string' ? { body: input } : { ...input }

		/** @type {string} */
		this.id = raw.id !== undefined ? String(raw.id) : ''
		/** @type {'location' | 'branch' | 'event' | 'milestone' | 'hearing'} */
		this.type = raw.type !== undefined ? raw.type : 'event'
		/** @type {string} */
		this.title = raw.title !== undefined ? String(raw.title) : ''
		/** @type {string} */
		this.location = raw.location !== undefined ? String(raw.location) : ''
		/** @type {{ lat?: number, lng?: number }} */
		this.coordinates = typeof raw.coordinates === 'object' && raw.coordinates !== null ? raw.coordinates : {}
		/** @type {Date|null} */
		this.starts_at = raw.starts_at ? new Date(raw.starts_at) : null
		/** @type {Date|null} */
		this.ends_at = raw.ends_at ? new Date(raw.ends_at) : null

		if (Array.isArray(raw.contacts)) {
			/** @type {Contact[]} */
			this.contacts = raw.contacts.map((c) => Contact.from(c))
		} else {
			/** @type {Contact[]} */
			this.contacts = []
		}
	}
}
