import { Model } from '@nan0web/types'

export class SiteConfig extends Model {
	static $single = true
	
	static $collection = 'site_config'
	
	static UI = {
		$singular: 'Site Configuration',
		$group: 'Settings'
	}

	static siteName = {
		help: 'Site name',
		type: 'string',
		localized: true,
		required: true,
	}

	static contactEmail = {
		help: 'Contact email',
		type: 'email',
	}

	static seo = {
		help: 'SEO Configuration',
		type: 'group',
		fields: {
			defaultTitle: { type: 'string', localized: true },
			defaultDescription: { type: 'string', localized: true },
		}
	}

	/**
	 * @param {Partial<SiteConfig>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Site name (localized) */ this.siteName
		/** @type {string} Contact email */ this.contactEmail
		/** @type {{defaultTitle?: string, defaultDescription?: string}} SEO Configuration */ this.seo
	}
}
