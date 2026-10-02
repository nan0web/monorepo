import { Model } from '@nan0web/types'
import { DocCategory } from './DocCategory.js'

export class DocPage extends Model {
	static $drafts = true
	static $collection = 'doc_pages'
	static UI = {
		$singular: 'Documentation Page',
		$plural: 'Documentation Pages',
		$group: 'Documentation'
	}

	static title = {
		help: 'Documentation Page title',
		type: 'string',
		localized: true,
		required: true,
	}

	static slug = {
		help: 'Documentation Page slug',
		type: 'string',
		required: true,
	}

	static category = {
		help: 'Documentation Page category',
		type: DocCategory,
		hasMany: false,
	}

	static content = {
		help: 'Documentation Page content',
		type: 'markdown',
		localized: true,
	}

	/**
	 * @param {Partial<DocPage>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Documentation Page title (localized) */ this.title
		/** @type {string} Documentation Page slug */ this.slug
		/** @type {DocCategory} Category */ this.category
		/** @type {string} Markdown content (localized) */ this.content
	}
}
