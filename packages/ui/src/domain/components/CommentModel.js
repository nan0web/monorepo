import { Model } from '@nan0web/types'

/**
 * CommentModel — OLMUI Model-as-Schema
 * Base model for user-generated comments / reviews.
 */
export class CommentModel extends Model {
	static $id = '@nan0web/ui/CommentModel'

	static author = {
		help: 'Author name',
		placeholder: 'Jane Doe',
		default: '',
		required: true,
	}
	static avatar = {
		help: 'Author avatar image URL',
		placeholder: 'https://...',
		default: '',
	}
	static text = {
		help: 'Comment body text',
		placeholder: 'Great product!',
		default: '',
		required: true,
	}
	static date = {
		help: 'Comment date (ISO 8601)',
		placeholder: '2026-01-01',
		default: '',
	}

	/**
	 * @param {Partial<CommentModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Author name */ this.author
		/** @type {string} Author avatar image URL */ this.avatar
		/** @type {string} Comment body text */ this.text
		/** @type {string} Comment date (ISO 8601) */ this.date
	}
}
