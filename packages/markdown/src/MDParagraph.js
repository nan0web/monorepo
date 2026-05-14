import MDElement from './MDElement.js'
import ParseContext from './Parse/Context.js'
import MDCodeInline from './MDCodeInline.js'

/**
 * Paragraph element.
 */
export default class MDParagraph extends MDElement {
	static get defaultTag() {
		return '<p>'
	}
	static get defaultEnd() {
		return '</p>'
	}
	static get defaultMdTag() {
		return ''
	}
	static get defaultMdEnd() {
		return '\n\n'
	}

	/**
	 * @param {string} text
	 * @param {ParseContext} [context={}]
	 * @returns {MDParagraph|false}
	 */
	static parse(text, context = new ParseContext()) {
		if ('' === text) return false

		let j = context.i

		if (j === context.rows.length - 1) {
			return new MDParagraph({ content: text })
		}

		const contentLines = []

		while (j < context.rows.length) {
			if (contentLines.length > 0 && '' === contentLines[contentLines.length - 1]) {
				contentLines.pop()
				// second \n
				if ('' === context.rows[j]) j++
				break
			}
			if (context.skipped.some((Element) => false !== Element.parse(context.rows[j], context))) {
				break
			}
			// Collect all next paragraph lines
			contentLines.push(context.rows[j])
			j++
		}

		if (contentLines.length > 0) {
			context.i = j
			return new MDParagraph({ content: contentLines.join('\n') })
		}

		return false
	}

	/**
	 * Override toString to handle inline elements properly
	 * @param {object} props
	 * @param {number} [props.indent=0]
	 * @param {string} [props.format=".md"]
	 * @returns {string}
	 */
	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}

		// Build final string with processed content
		return ' '.repeat(indent) + MDElement.processInline(this.content, format) + this.renderMdEnd()
	}
}
