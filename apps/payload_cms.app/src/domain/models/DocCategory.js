import { Model } from '@nan0web/types'

export class DocCategory extends Model {
	static $collection = 'doc_categories'
	static UI = {
		$singular: 'Category',
		$plural: 'Categories',
		$group: 'Documentation',
	}

	static title = {
		type: 'string',
		help: 'Document category title',
		localized: true,
		required: true,
	}

	static slug = {
		help: 'Document category slug',
		type: 'string',
		required: true,
	}

	/**
	 * @param {Partial<DocCategory>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Document category title (localized) */ this.title
		/** @type {string} Document category slug (localized) */ this.slug
	}
}
