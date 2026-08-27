/**
 * toNan0Html
 * Converts a Payload Lexical state JSON back into a NaN0HTML AST.
 *
 * Reconstructs:
 *   - Native Lexical nodes (paragraph, heading, list, listitem, text, link, etc.) -> NaN0HTML tags/strings
 *   - nan0-element -> exact tag + attributes + converted children
 *   - nan0-component -> component name + props object
 *   - nan0-raw -> restored raw tag + attributes + children
 */
import { FORMAT } from './fromNan0Html.js'

/**
 * Convert Payload Lexical state (or root node) back into a NaN0HTML AST.
 * @param {Object} lexicalState Lexical state object `{ root: { children: [...] } }` or node object
 * @returns {any} NaN0HTML AST structure (Array, Object, or String)
 */
export function toNan0Html(lexicalState) {
	if (!lexicalState) return null

	const root = lexicalState.root || lexicalState
	if (root.type === 'root' && Array.isArray(root.children)) {
		return convertNodes(root.children)
	}

	return convertNode(root)
}

/**
 * Convert an array of Lexical nodes.
 */
function convertNodes(nodes) {
	if (!Array.isArray(nodes) || nodes.length === 0) return []
	const result = []

	for (const node of nodes) {
		const converted = convertNode(node)
		if (converted !== null && converted !== undefined) {
			result.push(converted)
		}
	}

	if (result.length === 1) return result[0]
	return result
}

/**
 * Convert a single Lexical node into its NaN0HTML AST representation.
 */
function convertNode(node) {
	if (!node || typeof node !== 'object') return null

	switch (node.type) {
		case 'text':
			return convertTextNode(node)

		case 'paragraph':
			return wrapWithTag('p', convertNodes(node.children))

		case 'heading': {
			const tag = node.tag || 'h1'
			return wrapWithTag(tag, convertNodes(node.children))
		}

		case 'blockquote':
			return wrapWithTag('blockquote', convertNodes(node.children))

		case 'horizontalrule':
			return { hr: true }

		case 'linebreak':
			return { br: true }

		case 'list': {
			const tag = node.listType === 'number' || node.tag === 'ol' ? 'ol' : 'ul'
			const content = convertNodes(node.children)
			const attrs = {}
			if (node.start && node.start !== 1) {
				attrs.$start = node.start
			}
			return wrapWithTag(tag, content, attrs)
		}

		case 'listitem':
			return wrapWithTag('li', convertNodes(node.children))

		case 'link': {
			const fields = node.fields || {}
			const attrs = {}
			if (fields.url) attrs.$href = fields.url
			if (fields.newTab) attrs.$target = '_blank'
			if (fields.rel) attrs.$rel = fields.rel
			return wrapWithTag('a', convertNodes(node.children), attrs)
		}

		case 'upload': {
			const fields = node.fields || {}
			const attrs = {}
			if (fields.value) attrs.$src = typeof fields.value === 'string' ? fields.value : fields.value.id || ''
			return wrapWithTag('img', true, attrs)
		}

		case 'table':
			return wrapWithTag('table', convertNodes(node.children))

		case 'tablerow':
			return wrapWithTag('tr', convertNodes(node.children))

		case 'tablecell': {
			const tag = node.header ? 'th' : 'td'
			return wrapWithTag(tag, convertNodes(node.children))
		}

		case 'nan0-element': {
			const tag = node.tag || 'div'
			const attrs = formatAttributes(node.attributes || {})
			const content = convertNodes(node.children)
			return wrapWithTag(tag, content, attrs)
		}

		case 'nan0-component': {
			const compName = node.component || 'Component'
			const props = node.props || {}
			return { [compName]: props }
		}

		case 'nan0-raw': {
			const source = node.source || {}
			const tag = source.tag || 'div'
			const attrs = formatAttributes(source.attributes || {})
			const content = Array.isArray(source.children) ? convertNodes(source.children) : (source.children || [])
			return wrapWithTag(tag, content, attrs)
		}

		default:
			if (Array.isArray(node.children)) {
				return convertNodes(node.children)
			}
			return null
	}
}

/**
 * Format text node taking inline format flags into account.
 */
function convertTextNode(node) {
	const text = node.text || ''
	const format = node.format || 0
	let result = text

	if (format & FORMAT.bold) {
		result = { strong: result }
	}
	if (format & FORMAT.italic) {
		result = { em: result }
	}
	if (format & FORMAT.underline) {
		result = { u: result }
	}
	if (format & FORMAT.strikethrough) {
		result = { s: result }
	}

	return result
}

/**
 * Prefix attribute object keys with `$`.
 */
function formatAttributes(attrs) {
	const result = {}
	for (const [k, v] of Object.entries(attrs)) {
		const key = k.startsWith('$') ? k : `$${k}`
		result[key] = v
	}
	return result
}

/**
 * Wrap content with a tag and optional $attributes.
 */
function wrapWithTag(tag, content, attrs = {}) {
	const element = { ...attrs }
	element[tag] = content
	return element
}

export default toNan0Html
