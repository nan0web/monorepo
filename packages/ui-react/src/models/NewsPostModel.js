import { Model } from '@nan0web/core'

/**
 * NewsPostModel (v2)
 *
 * Domain model for articles and news posts.
 * Defines the canonical structure for multimedia content.
 */
export default class NewsPostModel extends Model {
	static label = 'news'

	static title = { help: 'news.title_help', default: '', type: 'string', required: true }
	static author = { help: 'news.author_help', default: '', type: 'string' }
	static date = { help: 'news.date_help', default: () => new Date().toISOString(), type: 'date' }
	static image = { help: 'news.image_help', default: '', type: 'string' }
	static images = { help: 'news.gallery_help', default: [], type: 'array' }
	static video = { help: 'news.video_help', default: '', type: 'string' }
	static url = { help: 'news.url_help', default: '', type: 'string' }
	static excerpt = { help: 'news.excerpt_help', default: '', type: 'text' }
	static content = { help: 'news.content_help', default: '', type: 'text' }
	static categories = { help: 'news.categories_help', default: [], type: 'array' }

	/**
	 * @param {Partial<NewsPostModel> | Record<string, any>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.id = data.id || Math.random().toString(36).substring(7)
		/** @type {string} */ this.title
		/** @type {string} */ this.author
		/** @type {string} */ this.date
		/** @type {string} */ this.image
		/** @type {string[]} */ this.images
		/** @type {string} */ this.video
		/** @type {string} */ this.url
		/** @type {string} */ this.excerpt
		/** @type {string} */ this.content
		/** @type {any[]} */ this.categories
	}
}
