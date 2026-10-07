import { Model } from '@nan0web/types'

/**
 * Media
 *
 * Media asset attachment for Post or other entities.
 * Supports hybrid positioning (Format A: inline shortcode anchor; Format B: placement directive).
 *
 * @class Media
 * @extends Model
 */
export default class Media extends Model {
	/** @type {string} */
	id = ''
	/** @type {string} */
	url = ''
	/** @type {string} */
	type = 'image'
	/** @type {string} */
	caption = ''
	/** @type {object} */
	placement = {}

	static id = { type: 'string', help: 'Anchor ID (e.g. photo-1)' }
	static url = { type: 'string', help: 'IPFS hash or HTTP URL' }
	static type = { type: 'string', help: 'image | video | audio | file', default: 'image' }
	static caption = { type: 'string', help: 'Caption or alt text', default: '' }
	static placement = { type: 'object', help: 'Placement directive (after_paragraph, align)', default: {} }

	constructor(data = {}, options = {}) {
		super(data, options)
		if (data.id !== undefined) this.id = data.id
		if (data.url !== undefined) this.url = data.url
		if (data.type !== undefined) this.type = data.type
		if (data.caption !== undefined) this.caption = data.caption
		if (data.placement !== undefined) this.placement = data.placement
	}
}
