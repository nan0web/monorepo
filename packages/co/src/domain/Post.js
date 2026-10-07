import Chat from './Chat.js'
import Media from './Media.js'

/**
 * Post
 * 
 * A rich piece of content. Extends Chat to optionally support threading/chains.
 * Supports hybrid media formatting:
 * - Format A (Anchor shortcodes in Markdown): ::media[id] or ![[id]] referencing Media.id
 * - Format B (Placement directive): positioned by Media.placement (e.g. after_paragraph: 2)
 *
 * @class Post
 * @extends Chat
 */
export default class Post extends Chat {
	/** @type {string} */
	id = ''
	/** @type {string} */
	title = ''
	/** @type {string[]} */
	tags = []
	/** @type {Media[]} */
	media = []

	// New ModelTypes paradigm: static fields directly on the class
	static id = { type: 'string', help: 'Unique post identifier' }
	static title = { type: 'string', help: 'Post headline or title' }
	static tags = { type: 'array', default: [], help: 'Categorization tags' }
	static media = { 
		type: [Media], 
		default: [], 
		help: 'Attached media items with hybrid placement support' 
	}

	constructor(input = {}) {
		super(input)
		if (input.id !== undefined) this.id = input.id
		if (input.title !== undefined) this.title = input.title
		if (input.tags !== undefined) this.tags = input.tags
		if (input.media !== undefined) {
			this.media = Array.isArray(input.media)
				? input.media.map((m) => Media.from(m))
				: input.media
		}
	}
}
