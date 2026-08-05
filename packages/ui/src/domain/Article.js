import { Model } from '@nan0web/types'

/**
 * Universal Article model with text/markdown content.
 */
export class Article extends Model {
	static $collection = 'articles'

	static title = {
		help: 'Article title',
		type: 'string',
		required: true,
		localized: true,
	}

	static slug = {
		help: 'Article URL slug',
		type: 'string',
		required: true,
		unique: true,
	}

	static content = {
		help: 'Markdown content',
		type: 'text/markdown',
		localized: true,
	}
}
