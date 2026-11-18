import MDElement from './MDElement.js'

/**
 * List item element.
 */
export default class MDListItem extends MDElement {
	static get defaultTag() {
		return '<li>'
	}
	static get defaultEnd() {
		return '</li>'
	}
	static get defaultMdTag() {
		return '- '
	}
	static get defaultMdEnd() {
		return '\n'
	}

	/** @type {string | null} */
	status = null
	/** @type {Record<string, string>} */
	badges = {}

	constructor(props = {}) {
		super(props)
		if (props.status !== undefined) {
			this.status = props.status
		}
		if (props.badges !== undefined) {
			this.badges = { ...props.badges }
		}
	}

	static parse(text) {
		const match = text.match(/^(-|\d+\.)\s+(.*)$/)
		if (!match) {
			return false
		}
		let content = match[2]
		let status = null
		const badges = {}

		// Check for task marker: [ ], [x], [X], [>], [-]
		const taskMatch = content.match(/^\[([ xX>\-])\]\s*(.*)$/)
		if (taskMatch) {
			const marker = taskMatch[1]
			if (marker === ' ' ) status = 'todo'
			else if (marker === 'x' || marker === 'X') status = 'done'
			else if (marker === '>') status = 'work'
			else if (marker === '-') status = 'fail'
			content = taskMatch[2]
		}

		// Extract badges: [key:value]
		const badgeRegex = /\[([a-zA-Z0-9_-]+):([^\]]+)\]/g
		let bMatch
		while ((bMatch = badgeRegex.exec(content)) !== null) {
			badges[bMatch[1]] = bMatch[2]
		}
		// Strip badge text from content
		content = content.replace(/\s*\[([a-zA-Z0-9_-]+):([^\]]+)\]/g, '').trim()


		return new MDListItem({
			content,
			status,
			badges,
		})
	}

	/**
	 * Render markdown string.
	 * @param {object} props
	 * @returns {string}
	 */
	toString(props = {}) {
		const { indent = 0, format = '.md' } = props
		if ('.html' === format) {
			return this.toHTML(props)
		}
		if ('.txt' === format) {
			return this.toTEXT(props)
		}

		let marker = ''
		if (this.status !== null && this.status !== undefined) {
			let mark = ' '
			if (this.status === 'done') mark = 'x'
			else if (this.status === 'work') mark = '>'
			else if (this.status === 'fail') mark = '-'
			else if (this.status === 'todo') mark = ' '
			marker = `[${mark}] `
		}

		const badgeStr = Object.entries(this.badges || {})
			.map(([k, v]) => ` [${k}:${v}]`)
			.join('')

		const contentLine = this.renderMdTag() + marker + this.content + badgeStr + this.renderMdEnd()
		const childrenLines = this.children.map((child) =>
			child.toString({ indent: indent + 2, format })
		)
		return [contentLine, ...childrenLines].filter((s) => '' !== s).join('')
	}

}

