import MDElement from './MDElement.js'

/**
 * Space element for representing empty lines or whitespace blocks.
 */
export default class MDSpace extends MDElement {
	constructor(props = {}) {
		super(props)
		if ('string' === typeof props) {
			props = { content: props }
		}
		const { content = '\n' } = props
		this.content = content
	}

	toHTML() {
		return ''
	}

	/**
	 * @param {string} text
	 * @param {{i?: number, rows?: string[]}} [context={}]
	 * @returns {MDSpace|false}
	 */
	static parse(text, context = {}) {
		let { i = 0, rows = [] } = context

		if (rows.length === 0) {
			return new MDSpace({ content: text })
		}

		const spaceLines = []
		let j = i

		while (j < rows.length && rows[j].trim() === '') {
			spaceLines.push(rows[j])
			j++
		}

		if (spaceLines.length > 0) {
			context.i = j
			return new MDSpace({ content: spaceLines.join('\n') + '\n' })
		}

		return false
	}
}
