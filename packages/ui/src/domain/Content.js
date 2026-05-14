import { Model } from '@nan0web/types'

/**
 * @typedef {Object} HTML5Elements
 * @property {string|ContentData[]} [a]
 * @property {string|ContentData[]} [abbr]
 * @property {string|ContentData[]} [address]
 * @property {string|ContentData[]} [area]
 * @property {string|ContentData[]} [article]
 * @property {string|ContentData[]} [aside]
 * @property {string|ContentData[]} [audio]
 * @property {string|ContentData[]} [b]
 * @property {string|ContentData[]} [base]
 * @property {string|ContentData[]} [bdi]
 * @property {string|ContentData[]} [bdo]
 * @property {string|ContentData[]} [blockquote]
 * @property {string|ContentData[]} [body]
 * @property {boolean|object} [br]
 * @property {string|ContentData[]} [canvas]
 * @property {string|ContentData[]} [caption]
 * @property {string|ContentData[]} [cite]
 * @property {string|ContentData[]} [code]
 * @property {string|ContentData[]} [col]
 * @property {string|ContentData[]} [colgroup]
 * @property {string|ContentData[]} [data]
 * @property {string|ContentData[]} [datalist]
 * @property {string|ContentData[]} [dd]
 * @property {string|ContentData[]} [del]
 * @property {string|ContentData[]} [details]
 * @property {string|ContentData[]} [dfn]
 * @property {string|ContentData[]} [dialog]
 * @property {string|ContentData[]} [div]
 * @property {string|ContentData[]} [dl]
 * @property {string|ContentData[]} [dt]
 * @property {string|ContentData[]} [em]
 * @property {string|ContentData[]} [embed]
 * @property {string|ContentData[]} [fieldset]
 * @property {string|ContentData[]} [figcaption]
 * @property {string|ContentData[]} [figure]
 * @property {any} [footer]
 * @property {string|ContentData[]} [form]
 * @property {string|ContentData[]} [h1]
 * @property {string|ContentData[]} [h2]
 * @property {string|ContentData[]} [h3]
 * @property {string|ContentData[]} [h4]
 * @property {string|ContentData[]} [h5]
 * @property {string|ContentData[]} [h6]
 * @property {string|ContentData[]} [head]
 * @property {any} [header]
 * @property {string|ContentData[]} [hgroup]
 * @property {boolean|object} [hr]
 * @property {string|ContentData[]} [html]
 * @property {string|ContentData[]} [i]
 * @property {string|ContentData[]} [iframe]
 * @property {string|ContentData[]} [img]
 * @property {string|ContentData[]} [ins]
 * @property {string|ContentData[]} [kbd]
 * @property {string|ContentData[]} [label]
 * @property {string|ContentData[]} [legend]
 * @property {string|ContentData[]} [li]
 * @property {string|ContentData[]} [link]
 * @property {string|ContentData[]} [main]
 * @property {string|ContentData[]} [map]
 * @property {string|ContentData[]} [mark]
 * @property {string|ContentData[]} [meta]
 * @property {string|ContentData[]} [meter]
 * @property {boolean|any} [input]
 * @property {boolean|any} [button]
 * @property {boolean|any} [select]
 * @property {string|ContentData[]} [nav]
 * @property {string|ContentData[]} [noscript]
 * @property {string|ContentData[]} [object]
 * @property {string|ContentData[]} [ol]
 * @property {string|ContentData[]} [optgroup]
 * @property {string|ContentData[]} [option]
 * @property {string|ContentData[]} [output]
 * @property {string|ContentData[]} [p]
 * @property {string|ContentData[]} [picture]
 * @property {string|ContentData[]} [pre]
 * @property {string|ContentData[]} [progress]
 * @property {string|ContentData[]} [q]
 * @property {string|ContentData[]} [rp]
 * @property {string|ContentData[]} [rt]
 * @property {string|ContentData[]} [ruby]
 * @property {string|ContentData[]} [s]
 * @property {string|ContentData[]} [samp]
 * @property {string|ContentData[]} [script]
 * @property {string|ContentData[]} [section]
 * @property {string|ContentData[]} [slot]
 * @property {string|ContentData[]} [small]
 * @property {string|ContentData[]} [source]
 * @property {string|ContentData[]} [span]
 * @property {string|ContentData[]} [strong]
 * @property {string|ContentData[]} [style]
 * @property {string|ContentData[]} [sub]
 * @property {string|ContentData[]} [summary]
 * @property {string|ContentData[]} [sup]
 * @property {string|ContentData[]} [table]
 * @property {string|ContentData[]} [tbody]
 * @property {string|ContentData[]} [td]
 * @property {string|ContentData[]} [template]
 * @property {string|ContentData[]} [textarea]
 * @property {string|ContentData[]} [tfoot]
 * @property {string|ContentData[]} [th]
 * @property {string|ContentData[]} [thead]
 * @property {string|ContentData[]} [time]
 * @property {string|ContentData[]} [title]
 * @property {string|ContentData[]} [tr]
 * @property {string|ContentData[]} [track]
 * @property {string|ContentData[]} [u]
 * @property {string|ContentData[]} [ul]
 * @property {string|ContentData[]} [var]
 * @property {string|ContentData[]} [video]
 * @property {string|ContentData[]} [wbr]
 * @property {string|ContentData[]} [svg]
 * @property {string|ContentData[]} [path]
 * @property {string|ContentData[]} [circle]
 * @property {string|ContentData[]} [rect]
 * @property {string|ContentData[]} [line]
 * @property {string|ContentData[]} [polyline]
 * @property {string|ContentData[]} [polygon]
 * @property {string|ContentData[]} [g]
 * @property {string|ContentData[]} [defs]
 * @property {string|ContentData[]} [symbol]
 * @property {string|ContentData[]} [use]
 * @property {string|ContentData[]} [text]
 */

/**
 * @typedef {Object} CoreUIElements
 * @property {import('./components/AccordionModel.js').AccordionModel} [accordion]
 * @property {import('./components/AutocompleteModel.js').AutocompleteModel} [autocomplete]
 * @property {import('./components/BannerModel.js').BannerModel} [banner]
 * @property {import('./components/BreadcrumbModel.js').BreadcrumbModel} [breadcrumb]
 * @property {import('./components/ButtonModel.js').ButtonModel} [button]
 * @property {import('./components/CommentModel.js').CommentModel} [comment]
 * @property {import('./components/ConfirmModel.js').ConfirmModel} [confirm]
 * @property {import('./components/EmptyStateModel.js').EmptyStateModel} [emptyState]
 * @property {import('./components/FAQModel.js').FAQModel} [faq]
 * @property {import('./components/FeatureGridModel.js').FeatureGridModel} [featureGrid]
 * @property {import('./components/GalleryModel.js').GalleryModel} [gallery]
 * @property {import('./HeaderModel.js').HeaderModel} [header]
 * @property {import('./FooterModel.js').FooterModel} [footer]
 * @property {import('./components/InputModel.js').InputModel} [input]
 * @property {import('./components/MarkdownModel.js').MarkdownModel} [markdown]
 * @property {import('./components/PriceModel.js').PriceModel} [price]
 * @property {import('./components/PricingModel.js').PricingModel} [pricing]
 * @property {import('./components/PricingSectionModel.js').PricingSectionModel} [pricingSection]
 * @property {import('./components/ProfileDropdownModel.js').ProfileDropdownModel} [profileDropdown]
 * @property {import('./components/SelectModel.js').SelectModel} [select]
 * @property {import('./components/ShellModel.js').ShellModel} [shell]
 * @property {import('./components/SpinnerModel.js').SpinnerModel} [spinner]
 * @property {import('./components/StatsItemModel.js').StatsItemModel} [statsItem]
 * @property {import('./components/StatsModel.js').StatsModel} [stats]
 * @property {import('./components/TableModel.js').TableModel} [tableUI]
 * @property {import('./components/TabsModel.js').TabsModel} [tabs]
 * @property {import('./components/TestimonialModel.js').TestimonialModel} [testimonial]
 * @property {import('./components/TimelineItemModel.js').TimelineItemModel} [timelineItem]
 * @property {import('./components/TimelineModel.js').TimelineModel} [timeline]
 * @property {import('./components/ToastModel.js').ToastModel} [toast]
 * @property {import('./components/TreeModel.js').TreeModel} [tree]
 * @property {ContentData[]} [sortable] - Інтерактивний Drag-n-Drop контейнер
 */

/**
 * @typedef {Partial<Content & HTML5Elements & CoreUIElements> & Record<string, any>} ContentData
 */

export class Content extends Model {
	static content = { type: 'string', help: 'Content' }
	static children = { type: 'array', model: Content, help: 'Children' }

	/**
	 * @param {ContentData | string} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		if ('string' === typeof data) {
			data = { content: data }
		}
		super(data, options)

		// ── Base Fields ──
		/** @type {string|undefined} Content */ this.content
		/** @type {Array<Content>|undefined} Children */ this.children

		// ── Hydration ──
		if (Array.isArray(this.children)) {
			this.children = this.children.map((child) => new Content(child, options))
		}

		const { content, children, ...rest } = /** @type {any} */ (data)

		for (const [key, value] of Object.entries(rest)) {
			/** @type {any} */ (this)[key] = value
		}
	}
}
