import { ContainerObject, resolveDefaults } from '@nan0web/types'

/**
 * @file Page Model — describes a page in the pages.yaml router.
 *
 * A Page captures the declarative description of a route.
 * Extends ContainerObject for recursive tree operations.
 */
export default class Page extends ContainerObject {
	static slug = {
		help: 'URL path segment',
		placeholder: 'cases',
		type: 'string',
		required: true,
		default: '',
	}
	static title = {
		help: 'Display title (i18n key or raw string)',
		placeholder: 'Court Cases',
		type: 'string',
		default: '',
	}
	static source = {
		help: 'Data binding key in Global State (e.g. "court.cases")',
		placeholder: 'court.cases',
		type: 'string',
		default: '',
	}
	static layout = {
		help: 'Rendering strategy',
		placeholder: 'page',
		type: 'enum',
		options: ['page', 'list', 'form', 'feed'],
		default: 'page',
	}
	static icon = {
		help: 'Optional icon identifier',
		placeholder: '⚖️',
		type: 'string',
		default: '',
	}
	static hidden = {
		help: 'Excluded from navigation',
		type: 'boolean',
		default: false,
	}
	static content = {
		help: 'Raw or Markdown content of the page',
		type: 'string',
		default: '',
	}
	static $content = {
		help: 'Parsed OLMUI renderable blocks',
		type: 'Array<any>',
		default: null,
		hidden: true,
	}

	/**
	 * @param {object} [input]
	 */
	constructor(input = {}) {
		super(input)
		/** @type {string} URL path segment */ this.slug
		/** @type {string} Display title (i18n key or raw string) */ this.title
		/** @type {string} Data binding key in Global State (e.g. "court.cases") */ this.source
		/** @type {string} Rendering strategy */ this.layout
		/** @type {string} Optional icon identifier */ this.icon
		/** @type {boolean} Excluded from navigation */ this.hidden
		/** @type {string} Raw or Markdown content of the page */ this.content
		/** @type {Array<any>|null} Parsed OLMUI renderable blocks */ this.$content
		/** @type {Page[]} Child pages */ this.children
		/** @type {number} Navigation order (from __order.yaml) */ this._order

		resolveDefaults(Page, this)
		Object.assign(this, input)
	}

	/**
	 * Full path from root (recursively built by Router).
	 * @type {string}
	 */
	get path() {
		return '/' + this.slug
	}

	/**
	 * @param {object} input
	 * @returns {Page}
	 */
	static from(input) {
		if (input instanceof Page) return input
		if (typeof input !== 'object' || input === null) return new Page()

		// If input has children, ensure they are Page instances
		if (input.children && Array.isArray(input.children)) {
			input.children = input.children.map((c) => Page.from(c))
		}

		return new Page(input)
	}
}
