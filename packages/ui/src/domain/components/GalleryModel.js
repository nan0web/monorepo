import { Model } from '@nan0web/types'

/**
 * GalleryModel — OLMUI Model-as-Schema
 * Image gallery / media grid with optional captions.
 */
export class GalleryModel extends Model {
	static $id = '@nan0web/ui/GalleryModel'

	static title = {
		help: 'Gallery section title',
		placeholder: 'Photo Gallery',
		default: '',
	}
	static items = {
		help: 'Gallery items (image URL + caption + alt)',
		type: 'object[]',
		default: [],
	}
	static columns = {
		help: 'Number of columns in grid layout',
		default: 3,
		type: 'number',
	}

	/**
	 * @param {Partial<GalleryModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Gallery section title */ this.title
		/** @type {Array<{src: string, caption?: string, alt?: string}>} Gallery items */ this.items
		/** @type {number} Number of columns in grid layout */ this.columns
	}
}
