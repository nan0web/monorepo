import Markdown from './Markdown.js'
import MDHeading from './MDHeading.js'
import MDHeading2 from './MDHeading2.js'
import MDHeading3 from './MDHeading3.js'
import MDCodeBlock from './MDCodeBlock.js'

/**
 * Campaign class extends MDHeading2
 */
export class Campaign extends MDHeading2 {
	/** @type {string} */
	name
	/** @type {string[]} */
	keywords
	/** @type {AdGroup[]} */
	adGroups

	/**
	 * @param {object} props
	 */
	constructor(props = {}) {
		super(props)
		this.name = this.content
		this.keywords = []
		this.adGroups = []
	}
}

/**
 * AdGroup class extends MDHeading3
 */
export class AdGroup extends MDHeading3 {
	/** @type {string} */
	name
	/** @type {string[]} */
	keywords
	/** @type {string[]} */
	headlines
	/** @type {string[]} */
	descriptions

	/**
	 * @param {object} props
	 */
	constructor(props = {}) {
		super(props)
		this.name = this.content
		this.keywords = []
		this.headlines = []
		this.descriptions = []
	}
}

/**
 * Extended Markdown parser for campaign/ad group structure.
 */
class ExtendedMarkdown extends Markdown {
	/** @type {(Campaign|AdGroup|MDHeading)[]} */
	elements

	constructor() {
		super()
		this.elements = []
	}

	/**
	 * Parse markdown text into extended elements.
	 * @param {string} text
	 * @returns {(Campaign|AdGroup|MDHeading)[]}
	 */
	parse(text) {
		// Get raw elements from the base parser.
		const rootElements = super.parse(text)
		this.elements = []

		if (!rootElements || rootElements.length === 0) {
			throw new Error('Parsed document has no children')
		}

		let currentCampaign = null
		let currentAdGroup = null

		for (let i = 0; i < rootElements.length; i++) {
			const el = rootElements[i]
			if (!(el instanceof MDHeading)) {
				this.elements.push(/** @type {any} */ (el))
				continue
			}

			// Determine heading level by counting # characters
			const tag = typeof el.mdTag === 'function' ? el.mdTag : el.mdTag
			const tagString = typeof tag === 'function' ? tag(el) : String(tag)
			const level = tagString.split('#').length - 1

			if (level === 2) {
				currentCampaign = new Campaign({
					content: el.content,
					tag: el.tag,
					end: el.end,
					mdTag: el.mdTag,
					mdEnd: el.mdEnd,
				})
				this.elements.push(currentCampaign)
				currentAdGroup = null
				continue
			}
			if (level === 3) {
				if (!currentCampaign) {
					this.elements.push(/** @type {any} */ (el))
					continue
				}
				currentAdGroup = new AdGroup({
					content: el.content,
					tag: el.tag,
					end: el.end,
					mdTag: el.mdTag,
					mdEnd: el.mdEnd,
				})
				currentCampaign.adGroups.push(currentAdGroup)
				this.elements.push(currentAdGroup)
				continue
			}
			if (level === 4) {
				if (!currentAdGroup) {
					this.elements.push(/** @type {any} */ (el))
					continue
				}
				const variableName = el.content.toLowerCase()
				const next = rootElements[i + 1]
				if (next && next instanceof MDCodeBlock) {
					const lines = next.content
						.split('\n')
						.map((s) => s.trim())
						.filter(Boolean)
					if (variableName === 'keywords') {
						currentAdGroup.keywords = lines
					} else if (variableName === 'headlines') {
						currentAdGroup.headlines = lines
					} else if (variableName === 'descriptions') {
						currentAdGroup.descriptions = lines
					}
					i++ // skip the code block element
					continue
				}
				this.elements.push(/** @type {any} */ (el))
				continue
			}
			this.elements.push(/** @type {any} */ (el))
		}

		return this.elements
	}
}

export default ExtendedMarkdown
