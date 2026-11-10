import Message from './Message.js'
import Contact from './Contact.js'

/**
 * Interaction
 * 
 * Fundamental exchange, ticket, inquiry, or order over time.
 * Extends Message so it inherently has time, body (content), and metadata.
 *
 * @class Interaction
 * @extends Message
 */
export default class Interaction extends Message {
	static id = { type: 'string', help: 'Unique interaction / ticket ID' }
	static type = {
		type: 'string',
		help: 'Interaction type',
		default: 'intake',
		validate: (val) => ['intake', 'order', 'contact', 'feedback', 'vote'].includes(val) || true,
	}
	static title = { type: 'string', help: 'Topic or subject', default: '' }
	static status = {
		type: 'string',
		help: 'Lifecycle status',
		default: 'new',
		validate: (val) =>
			['new', 'pending', 'processing', 'resolved', 'rejected', 'spam', 'archived'].includes(val) ||
			'Invalid interaction status',
	}
	static sender = { type: 'object', help: 'Sender contact' }
	static payload = { type: 'object', default: {}, help: 'Arbitrary business data' }
	static tags = { type: 'array', default: [], help: 'Interaction tags' }

	/**
	 * @param {Record<string, any>} [input]
	 */
	constructor(input = {}) {
		super(input)
		const raw = typeof input === 'string' ? { body: input } : { ...input }

		/** @type {string} */
		this.id = raw.id !== undefined ? String(raw.id) : ''
		/** @type {string} */
		this.type = raw.type !== undefined ? String(raw.type) : 'intake'
		/** @type {string} */
		this.title = raw.title !== undefined ? String(raw.title) : ''
		/** @type {'new' | 'pending' | 'processing' | 'resolved' | 'rejected' | 'spam' | 'archived'} */
		this.status = raw.status !== undefined ? raw.status : 'new'
		/** @type {Contact} */
		this.sender = raw.sender !== undefined ? Contact.from(raw.sender) : new Contact()
		/** @type {Record<string, any>} */
		this.payload = typeof raw.payload === 'object' && raw.payload !== null ? raw.payload : {}
		/** @type {string[]} */
		this.tags = Array.isArray(raw.tags) ? raw.tags : []
	}
}
