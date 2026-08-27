import { Model } from '@nan0web/types'

/**
 * CnAI News Collector configuration model (Model-as-Schema).
 * Defines validation rules and defaults for news collection parameters.
 */
export class NewsCollectorConfig extends Model {
	/** @type {string} Filter keyword */
	keyword = ''
	/** @type {number} Limit (1-50) */
	limit = 10
	/** @type {string[]} News sources */
	sources = ['HackerNews', 'Reddit']
	/** @type {boolean} Use cache */
	cached = true

	static keyword = {
		help: 'Filter by keyword (e.g., "LLM", "agents")',
		default: '',
	}

	static limit = {
		help: 'Number of articles to fetch (1-50)',
		default: 10,
	}

	static sources = {
		help: 'News sources to collect from',
		default: ['HackerNews', 'Reddit'],
	}

	static cached = {
		help: 'Use cached results if available (24h TTL)',
		default: true,
	}

	/**
	 * @param {Partial<NewsCollectorConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		Object.assign(this, data)
	}

	/**
	 * Check if configuration is valid.
	 * @returns {boolean}
	 */
	validate() {
		const errors = this.getValidationErrors()
		return errors.length === 0
	}

	/**
	 * Get validation error messages.
	 * @returns {string[]}
	 */
	getValidationErrors() {
		const errors = []
		if (this.limit < 1 || this.limit > 50) {
			errors.push('Limit must be between 1 and 50')
		}
		if (!Array.isArray(this.sources) || this.sources.length === 0) {
			errors.push('At least one news source is required')
		}
		return errors
	}
}
