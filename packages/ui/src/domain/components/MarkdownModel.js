import { Model } from '@nan0web/types'

/**
 * MarkdownModel — OLMUI Model-as-Schema
 * Represents a rich text block powered by Markdown.
 */
export class MarkdownModel extends Model {
	static $id = '@nan0web/ui/MarkdownModel'

	static content = {
		help: 'Markdown content string',
		type: 'textarea',
		default: '',
	}

	/**
	 * @param {Partial<MarkdownModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Markdown content string */ this.content
	}
}
