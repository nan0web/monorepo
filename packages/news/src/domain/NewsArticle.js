import { Model } from '@nan0web/types'

/**
 * News Article model with self-describing schema (Model-as-Schema).
 * Represents a single article from a news source.
 *
 * @alias PayloadCMS.News
 * @alias CMS.News
 * @alias Plural:News
 */
export class NewsArticle extends Model {
	static title = {
		help: 'Article title',
		default: '',
	}

	static source = {
		help: 'News source (HackerNews, Reddit, Twitter, etc.)',
		default: 'HackerNews',
	}

	static url = {
		help: 'Article URL',
		default: '',
	}

	static score = {
		help: 'Engagement score (upvotes, retweets, etc.)',
		default: 0,
	}

	static published = {
		help: 'Publication timestamp (ISO 8601)',
		default: new Date().toISOString(),
	}

	static keywords = {
		help: 'Extracted keywords',
		default: [],
	}

	/**
	 * @param {Partial<NewsArticle>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Article title */ this.title
		/** @type {string} News source */ this.source
		/** @type {string} Article URL */ this.url
		/** @type {number} Engagement score */ this.score
		/** @type {string} Publication timestamp */ this.published
		/** @type {string[]} Extracted keywords */ this.keywords
	}
}
