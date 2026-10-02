import { Model } from '@nan0web/types'

export class MediaAsset extends Model {
	static $upload = {
		mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
		imageSizes: [{ name: 'thumb', width: 300 }],
	}

	static $collection = 'media_assets'

	static UI = {
		$singular: 'Media Asset',
		$plural: 'Media Assets',
		$group: 'Assets',
	}

	static alt = {
		help: 'Media Asset alt text',
		type: 'string',
		localized: true,
	}

	/**
	 * @param {Partial<MediaAsset>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Alt text (localized) */ this.alt
	}
}
