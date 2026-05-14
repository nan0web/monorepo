import { CommentModel } from './CommentModel.js'

/**
 * TestimonialModel — OLMUI Model-as-Schema
 * Extends CommentModel with a rating field for testimonials/reviews.
 */
export class TestimonialModel extends CommentModel {
	static $id = '@nan0web/ui/TestimonialModel'

	static rating = {
		help: 'Rating from 1 to 5 stars',
		default: 5,
		type: 'number',
	}

	/**
	 * @param {Partial<TestimonialModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} Rating from 1 to 5 stars */ this.rating
	}
}
