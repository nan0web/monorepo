import Chat from './Chat.js'
import Contact from './Contact.js'
import Media from './Media.js'

/**
 * Post
 * 
 * A rich piece of content (Page, Post, News, Doc, Case).
 * Extends Chat to natively support message chains, comment trees, and authoring.
 * Supports both string[] media references (Fractal 7i) and Media[] objects (backward compatibility).
 *
 * @class Post
 * @extends Chat
 */
export default class Post extends Chat {
	static id = { type: 'string', help: 'Unique post identifier (URL slug)' }
	static type = {
		type: 'string',
		help: 'Content type',
		default: 'post',
		validate: (val) => ['page', 'post', 'news', 'doc', 'case'].includes(val) || 'Type must be page, post, news, doc, or case',
	}
	static title = { type: 'string', help: 'Post headline or title (H1)', default: '' }
	static excerpt = { type: 'string', help: 'Lead or short summary', default: '' }
	static body = { type: 'string', help: 'Main content (Markdown / sections)', default: '' }
	static time = { type: 'date', help: 'Publication date / timestamp' }
	static status = {
		type: 'string',
		help: 'Publication status',
		default: 'draft',
		validate: (val) => ['draft', 'plan', 'live', 'archived', 'deleted'].includes(val) || 'Invalid status',
	}
	static authors = {
		type: 'array',
		default: [],
		help: 'List of authors (Contact[] or Identity IDs)',
	}
	static tags = { type: 'array', default: [], help: 'Categorization tags' }
	static media = {
		type: [Media],
		default: [],
		help: 'Array of attached media items (Media[] or media ID string[])',
	}

	/**
	 * @param {Record<string, any>} [input]
	 */
	constructor(input = {}) {
		const raw = typeof input === 'string' ? { body: input } : { ...input }

		if (raw.authors && Array.isArray(raw.authors) && raw.authors.length > 0 && !raw.author) {
			raw.author = raw.authors[0]
		}

		super(raw)

		/** @type {string} */
		this.id = raw.id !== undefined ? String(raw.id) : ''
		/** @type {'page' | 'post' | 'news' | 'doc' | 'case'} */
		this.type = raw.type !== undefined ? raw.type : 'post'
		/** @type {string} */
		this.title = raw.title !== undefined ? String(raw.title) : ''
		/** @type {string} */
		this.excerpt = raw.excerpt !== undefined ? String(raw.excerpt) : ''
		/** @type {'draft' | 'plan' | 'live' | 'archived' | 'deleted'} */
		this.status = raw.status !== undefined ? raw.status : 'draft'
		/** @type {string[]} */
		this.tags = Array.isArray(raw.tags) ? raw.tags : []

		/** @type {Array<Media|string>} */
		this.media = []
		if (Array.isArray(raw.media)) {
			this.media = raw.media.map((m) => {
				if (typeof m === 'object' && m !== null) {
					return m instanceof Media ? m : new Media(m)
				}
				return String(m)
			})
		}

		if (Array.isArray(raw.authors)) {
			/** @type {Contact[]} */
			this.authors = raw.authors.map((a) => Contact.from(a))
		} else if (raw.author) {
			/** @type {Contact[]} */
			this.authors = [Contact.from(raw.author)]
		} else {
			/** @type {Contact[]} */
			this.authors = this.author ? [this.author] : []
		}
	}

	/**
	 * Lead author of the post.
	 *
	 * @returns {Contact}
	 */
	get author() {
		if (this.authors && this.authors.length > 0) {
			return this.authors[0]
		}
		return super.author
	}

	set author(val) {
		const contact = Contact.from(val)
		if (this.authors && this.authors.length > 0) {
			this.authors[0] = contact
		} else {
			this.authors = [contact]
		}
	}
}
