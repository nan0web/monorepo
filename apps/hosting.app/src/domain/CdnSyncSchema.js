import { Model, ModelError } from '@nan0web/types'

export class CdnSyncSchema extends Model {
	static UI = {
		errorInvalidProvider: 'Invalid CDN provider option',
		errorTokenRequired: 'API token is required for the selected CDN provider',
	}

	static cdn_provider = {
		type: 'string',
		options: ['Cloudflare', 'BunnyCDN', 'Local Static'],
		default: 'Local Static',
		validate: (v) => ['Cloudflare', 'BunnyCDN', 'Local Static'].includes(v) || CdnSyncSchema.UI.errorInvalidProvider,
	}

	static api_token = {
		type: 'string',
		required: false,
	}

	static proxied = {
		type: 'boolean',
		default: false,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.cdn_provider
		/** @type {string} */ this.api_token
		/** @type {boolean} */ this.proxied
	}

	validate() {
		super.validate()
		if (this.cdn_provider !== 'Local Static' && (!this.api_token || this.api_token === '')) {
			throw new ModelError({
				api_token: CdnSyncSchema.UI.errorTokenRequired
			})
		}
		return true
	}
}

export default CdnSyncSchema
