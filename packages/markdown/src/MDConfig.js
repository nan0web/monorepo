import MDElement from './MDElement.js'
import ParseContext from './Parse/Context.js'

class MDConfig extends MDElement {
	mdTag = '---\n'
	mdEnd = '\n---'
	tag = '<!--\n'
	end = '\n-->'

	/** @type {object} */
	config = {}

	/** @type {Map<number, string>} */
	$comments = new Map()

	constructor(props = {}) {
		const { config = {}, $comments = new Map() } = props
		super(props) // Call the parent constructor
		this.config = config
		this.$comments = $comments
	}

	/**
	 * Parse config from text.
	 * @param {string} text
	 * @param {ParseContext} context
	 * @returns {MDConfig | false}
	 */
	static parse(text, context = new ParseContext()) {
		let { i = 0, rows = [] } = context
		if (text && 0 === rows.length) {
			rows = String(text).split('\n')
		}
		if (0 !== i || '---' !== rows[i]) {
			return false
		}
		const startI = i
		let content = ''
		const config = {}
		const $comments = new Map()
		let row = '---'
		let ended = false
		do {
			row = rows[++i]
			const [key, ...value] = String(row).split(': ')
			if (key.startsWith('# ')) {
				$comments.set(i, key.slice(2))
			} else if (!key) {
				console.warn('No key found in config row', row)
				context.i = startI
				break
			} else if ('---' === key && value.length === 0) {
				ended = true
				break
			} else {
				config[key] = value.join(': ')
			}
			content += row + '\n'
		} while ('---' !== row && i < rows.length)
		if (!ended) {
			return false
		}
		context.i = i + 1
		return new MDConfig({ config, $comments, content: content.trim() })
	}

	/**
	 * Create a config from a props object or string.
	 * @param {MDConfig | object | string} props
	 * @returns {MDConfig}
	 */
	static from(props) {
		if (props instanceof MDConfig) return props
		return new MDConfig(props)
	}
}

export default MDConfig
