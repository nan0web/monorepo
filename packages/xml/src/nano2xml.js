import { clone } from '@nan0web/types'
import escape from './escape.js'
import nano2attrs from './nano2attrs.js'

/**
 * @typedef {object} DefaultTagOption
 * @property {string[]} [$cdataTags]
 * @property {boolean | string | ((tag: string, content: any) => boolean | string)} [$selfClosed]
 * @property {object} [$tagAttrs]
 * @property {string} [$default]
 * @property {string} [$attrCase]
 * @property {string} [$attrTrue]
 */

/**
 * Determine whether a content value should be considered empty.
 * @param {*} content - The content to evaluate.
 * @returns {boolean} True when content is empty.
 */
function isContentEmpty(content) {
	if (true === content || null === content || '' === content) return true
	if (Array.isArray(content) && content.length === 0) return true
	if (typeof content === 'object' && content !== null && Object.keys(content).length === 0)
		return true
	return false
}

/**
 * Check whether the content can be rendered on a single line.
 * @param {*} content - The content to evaluate.
 * @returns {boolean} True for primitive types.
 */
function isSingleLine(content) {
	return ['boolean', 'number', 'string'].includes(typeof content)
}

/**
 * Extract embedded tag attributes from a key using a mapping of separators.
 *
 * @param {string} key - The raw key (e.g. "div.main#id").
 * @param {Object<string,string>} $tagAttrs - Mapping of separators to attribute names.
 * @returns {[string,Object]} Tag name and attribute map.
 */
function getEmbedTagAttributes(key, $tagAttrs) {
	let remaining = key
	const attrs = {}

	// Handle #id first to ensure id before class in insertion order
	const idMatch = remaining.match(/#([^\s.#]+)/)
	if (idMatch) {
		attrs.$id = idMatch[1]
		remaining = remaining.replace(idMatch[0], '')
	}

	// Handle .class multiple times
	let classStr = ''
	while (remaining.includes('.')) {
		const classMatch = remaining.match(/\.([^\s.#]+)/)
		if (classMatch) {
			classStr += (classStr ? ' ' : '') + classMatch[1]
			remaining = remaining.replace(classMatch[0], '')
		} else {
			break
		}
	}
	if (classStr) {
		attrs.$class = classStr
	}

	// Tag name is the remaining after removing leading separators
	const cleanTag = remaining.replace(/^[.#]*/, '')
	return [cleanTag, attrs]
}

/**
 * Convert a nano‑style JavaScript object to XML.
 *
 * @param {Object|Array} data - Input nano structure.
 * @param {Object} [options={}] - Conversion options.
 * @param {string} [options.indent='\t'] - Indentation string.
 * @param {string} [options.newLine='\n'] - New line string.
 * @param {DefaultTagOption} [options.defaultTags={}] - Tag configuration.
 * @returns {string} XML string.
 */
function nano2xml(data, { indent = '\t', newLine = '\n', defaultTags = {} } = {}) {
	const nano = clone(data)

	/**
	 * Recursive conversion helper.
	 *
	 * @param {*} obj - Current data chunk.
	 * @param {string} [currentIndent=''] - Indentation for the current level.
	 * @param {string|null} [parent=null] - Parent tag name.
	 * @param {*} [prev=null] - Previous sibling.
	 * @returns {string} XML fragment.
	 */
	function convertToXml(obj, currentIndent = '', parent = null, prev = null) {
		let xml = ''

		// Handle arrays
		if (Array.isArray(obj)) {
			const tag = defaultTags[parent ?? '']
			if (tag) {
				// Render each array item as <tag>content</tag>
				const itemStrs = obj.map((el) => {
					let content = el
					let itemAttrs = {}
					if (typeof el === 'object' && el !== null) {
						Object.entries(el).forEach(([key, value]) => {
							if (key === tag) {
								content = value
							} else if (key.startsWith('$')) {
								itemAttrs[key] = value
							}
							// Ignore other keys
						})
					}
					const contentXml = convertToXml(content, currentIndent + indent, tag, el)
					const attrStr = nano2attrs(itemAttrs, defaultTags)
					let selfClosedLogic = defaultTags.$selfClosed
					if (typeof selfClosedLogic === 'function') {
						selfClosedLogic = selfClosedLogic.apply(defaultTags, [tag, content])
					}
					const isEmptyContent = isContentEmpty(content)
					const isSelfClosedTag = !!selfClosedLogic && isEmptyContent
					const openTag = `${currentIndent}<${tag}${attrStr}>`
					const closeTag = `</${tag}>`
					if (isSelfClosedTag) {
						const closeStr = typeof selfClosedLogic === 'boolean' ? ` />` : selfClosedLogic
						return `${currentIndent}<${tag}${attrStr}${closeStr}`
					}
					if (isEmptyContent) {
						return `${openTag}${closeTag}`
					}
					if (isSingleLine(content)) {
						return `${openTag}${contentXml}${closeTag}`
					}
					// Block content
					let blockContent = contentXml
					if (newLine && blockContent.endsWith(newLine)) {
						blockContent = blockContent.slice(0, -newLine.length)
					}
					return `${openTag}${newLine}${blockContent}${newLine}${currentIndent}${closeTag}`
				})
				xml += itemStrs.join(newLine)
			} else {
				// No wrapping tag: render children as siblings
				xml += obj.map((el) => convertToXml(el, currentIndent, parent, prev)).join(newLine)
			}
		}

		// Handle objects
		else if (typeof obj === 'object' && obj !== null) {
			const attrs = {}
			const comments = {}
			const tags = {}

			// Separate attributes, comments, processing instructions, and tags
			Object.entries(obj).forEach(([key, value]) => {
				if (key.startsWith('$')) {
					attrs[key] = value
				} else if (key.startsWith('#')) {
					comments[key] = value
				} else if (key.startsWith('?')) {
					tags[key] = value
				} else {
					const $tagAttrs = defaultTags.$tagAttrs
					if (
						typeof $tagAttrs === 'object' &&
						$tagAttrs !== null &&
						(key.includes('.') || key.includes('#'))
					) {
						const [tag, found] = getEmbedTagAttributes(key, $tagAttrs)
						Object.entries(found).forEach(([aKey, v]) => {
							if (attrs[aKey] === undefined) {
								attrs[aKey] = v
							} else {
								attrs[aKey] += ' ' + v
							}
						})
						tags[tag] = value
					} else {
						tags[key] = value
					}
				}
			})

			// Use default tag if no tags but has attrs
			if (Object.keys(tags).length === 0 && Object.keys(attrs).length > 0) {
				const defaultTag = defaultTags.$default
				if (defaultTag) {
					tags[defaultTag] = true
				}
			}

			// Render comments
			const commentStrs = Object.entries(comments).map(([commentKey, value]) => {
				const text = `${commentKey.slice(1)}${value !== true && value ? `: ${value}` : ''}`
				return `${currentIndent}<!-- ${text} -->`
			})

			// Render tags/processing instructions
			const tagStrs = Object.entries(tags).map(([tag, content]) => {
				let $selfClosed = defaultTags.$selfClosed
				if (typeof $selfClosed === 'function') {
					$selfClosed = $selfClosed.apply(defaultTags, [tag, content])
				}
				const isSelfClosedContent = !!$selfClosed && isContentEmpty(content)
				const attrStr = nano2attrs(attrs, defaultTags)

				// Special handling for processing instructions
				if (tag.startsWith('?')) {
					const closeStr = $selfClosed || '?>'
					return `${currentIndent}<${tag}${attrStr}${closeStr}`
				}

				if (isSelfClosedContent) {
					const closeStr = typeof $selfClosed === 'boolean' ? ' />' : $selfClosed
					return `${currentIndent}<${tag}${attrStr}${closeStr}`
				}

				const fullOpen = `${currentIndent}<${tag}${attrStr}>`
				const fullClose = `</${tag}>`

				if (isContentEmpty(content)) {
					return `${fullOpen}${fullClose}`
				}

				if (isSingleLine(content)) {
					if (defaultTags.$cdataTags && defaultTags.$cdataTags.includes(tag)) {
						return `${fullOpen}<![CDATA[${content}]]>${fullClose}`
					}
					return `${fullOpen}${escape(content)}${fullClose}`
				}

				// Block content
				const contentOutput = convertToXml(content, currentIndent + indent, tag)
				let adjustedContent = contentOutput
				if (newLine && adjustedContent.endsWith(newLine)) {
					adjustedContent = adjustedContent.slice(0, -newLine.length)
				}
				return `${fullOpen}${newLine}${adjustedContent}${newLine}${currentIndent}${fullClose}`
			})

			// Combine sections with newLine separator
			const sections = []
			if (commentStrs.length > 0) {
				sections.push(commentStrs.join(newLine))
			}
			if (tagStrs.length > 0) {
				sections.push(tagStrs.join(newLine))
			}
			xml += sections.join(newLine)
		}

		// Handle primitives
		else {
			xml += escape(obj)
		}

		// Trim trailing newline if present (only if newLine is non-empty)
		if (newLine && xml.endsWith(newLine)) {
			xml = xml.slice(0, -newLine.length)
		}

		// Trim leading newline for root
		if (currentIndent === '' && xml.startsWith(newLine)) {
			xml = xml.slice(newLine.length)
		}

		return xml
	}

	return convertToXml(nano, '', null, null)
}

export default nano2xml
