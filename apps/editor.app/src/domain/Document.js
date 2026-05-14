import { Model } from '@nan0web/ui'

/**
 * Document — The universal content model for the NaN•Web ecosystem.
 * Follows the OLMUI architectural pattern for data-driven applications.
 */
export class Document extends Model {
	static $url = {
		help: 'Document Unique Resource Location (URL)',
		default: '',
	}
	static $deleted = {
		help: 'Document status (0 - active, 1 - deleted)',
		default: 0,
	}
	static $hidden = {
		help: 'Document visibility (0 - visible, 1 - hidden)',
		default: 0,
	}
	static title = {
		help: 'Document title',
		default: ''
	}
	static description = {
		help: 'Document description or summary',
		default: ''
	}
	static content = {
		help: 'Structured NaN•Web content (objects, tags, values)',
		type: 'object',
		default: {}
	}
	static image = {
		help: 'Primary image URL',
		default: '',
	}
	static icon = {
		help: 'Visual icon identifier',
		default: 'article',
	}
	static metrics = {
		help: 'Associated key-value metrics',
		type: 'object',
		default: {}
	}
	static order = {
		help: 'Ordering weight (numerical priority)',
		type: 'number',
		default: 0
	}

	/**
	 * @param {Partial<Document>} [data]
	 * @param {import('@nan0web/ui').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.$url
		/** @type {number} */ this.$deleted
		/** @type {number} */ this.$hidden
		/** @type {string} */ this.title
		/** @type {string} */ this.description
		/** @type {object} */ this.content
		/** @type {string} */ this.image
		/** @type {string} */ this.icon
		/** @type {object} */ this.metrics
		/** @type {number} */ this.order
	}

	/**
	 * Валідація полів документа.
	 * @returns {{ field: string, error: string }[]}
	 */
	resolveValidation() {
		const errors = []
		if (!this.title || this.title.trim() === '') {
			errors.push({ field: 'title', error: 'Title is required' })
		}
		return errors
	}

	/**
	 * Рекурсивний резолвінг посилань у документі.
	 * @param {object} doc
	 * @param {object} options
	 * @param {import('@nan0web/db').DB} options.db
	 * @param {Set<string>} [visited] - Захист від циклічних посилань
	 * @returns {Promise<object>}
	 */
	static async resolveReferences(doc, { db }, visited = new Set()) {
		if (!doc || typeof doc !== 'object') return doc
		
		const resolved = Array.isArray(doc) ? [] : {}
		
		for (const [key, value] of Object.entries(doc)) {
			if (value && typeof value === 'object' && value.$ref) {
				const refPath = value.$ref
				if (visited.has(refPath)) {
					resolved[key] = value // Циклічне посилання — повертаємо як є
					continue
				}
				visited.add(refPath)
				const target = await db.loadDocument(refPath).catch(() => null)
				if (!target) {
					resolved[key] = value
					continue
				}
				resolved[key] = await Document.resolveReferences(target, { db }, visited)
			} else if (value && typeof value === 'object') {
				resolved[key] = await Document.resolveReferences(value, { db }, visited)
			} else {
				resolved[key] = value
			}
		}
		
		return resolved
	}
}
