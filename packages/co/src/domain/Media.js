import { Model } from '@nan0web/types'

/**
 * Media
 *
 * Sovereign Media asset artifact.
 * Clean model with zero presentation/placement concerns,
 * while maintaining backward compatibility for legacy properties.
 *
 * @class Media
 * @extends Model
 */
export default class Media extends Model {
	static id = { type: 'string', help: 'Unique media identifier (e.g. photo-1)' }
	static url = { type: 'string', help: 'File path, IPFS hash or HTTP URL' }
	static mime = { type: 'string', help: 'MIME type of file (e.g. image/jpeg, video/mp4)', default: 'image/jpeg' }
	static type = { type: 'string', help: 'Legacy category or type (image, video, etc.)', default: 'image' }
	static caption = { type: 'string', help: 'Caption or alt text', default: '' }
	static filesize = { type: 'number', help: 'Size in bytes', default: 0 }
	static dimensions = { type: 'object', help: 'Media dimensions { width, height }', default: {} }
	static placement = { type: 'object', help: 'Legacy placement directive' }

	/**
	 * @param {Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string} Unique media identifier (e.g. photo-1) */ this.id = this.id || ''
		/** @type {string} File path, IPFS hash or HTTP URL */ this.url = this.url || ''
		/** @type {string} Caption or alt text */ this.caption = this.caption || ''
		/** @type {number} Size in bytes */ this.filesize = typeof this.filesize === 'number' ? this.filesize : 0
		/** @type {{ width?: number, height?: number }} Media dimensions { width, height } */
		this.dimensions = typeof this.dimensions === 'object' && this.dimensions !== null ? this.dimensions : {}
		/** @type {Record<string, any>|undefined} Legacy placement directive */
		this.placement = data.placement !== undefined ? data.placement : undefined

		if (data.mime) {
			/** @type {string} MIME type of file (e.g. image/jpeg, video/mp4) */ this.mime = data.mime
		} else if (data.type) {
			/** @type {string} MIME type of file (e.g. image/jpeg, video/mp4) */ this.mime = `${data.type}/octet-stream`
		} else {
			/** @type {string} MIME type of file (e.g. image/jpeg, video/mp4) */ this.mime = this.mime || 'image/jpeg'
		}
	}

	/**
	 * Category derived from MIME type (image, video, audio, etc.) or legacy type.
	 *
	 * @returns {string}
	 */
	get type() {
		if (this.mime && typeof this.mime === 'string') {
			return this.mime.split('/')[0]
		}
		return 'file'
	}

	set type(val) {
		if (val) {
			this.mime = `${val}/octet-stream`
		}
	}
}
