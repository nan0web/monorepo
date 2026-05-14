import stringWidth from 'string-width'
import { to, typeOf, empty } from '@nan0web/types'
import FrameProps from './Props.js'

export class FrameRenderMethod {
	static APPEND = 'append'
	static REPLACE = 'replace'
	static VISIBLE = 'visible'
}

/**
 * @link https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797 - ANSI escape codes
 */
export default class Frame {
	/** @type {typeof FrameRenderMethod} */
	static RenderMethod = FrameRenderMethod
	static Props = FrameProps
	/** @type {string} End of line */
	static EOL = '\n'
	/** @type {string} Beginning of line */
	static BOL = '\r'
	/** @type {string} Beginning of frame */
	static BOF = '\x1b[0;0H'
	/** @type {string} Hide cursor */
	static HIDE_CURSOR = '\x1b[?25l'
	/** @type {string} Show cursor */
	static SHOW_CURSOR = '\x1b[?25h'
	/** @type {string} Tab */
	static TAB = '\t'
	/** @type {string} Bold */
	static BOLD = '\x1b[1m'
	/** @type {string} Italic */
	static ITALIC = '\x1b[3m'
	/** @type {string} Underline */
	static UNDERLINE = '\x1b[4m'
	/** @type {string} Strikethrough */
	static STRIKETHROUGH = '\x1b[9m'
	/** @type {string} Reset */
	static RESET = '\x1b[0m'
	/** @type {string} Clear line */
	static CLEAR_LINE = '\x1b[2K'
	/**
	 * @example
	 * ```js
	 * new Frame([
	 * 	["Hello", "World"],
	 * 	[["Hello", { color: "red", bgColor: "#009" }], "World"],
	 * 	["<b i fg=#900>Hello</b>", "<i>World</i>"],
	 * ])
	 * ```
	 * @type {string[][]|any[][]}
	 */
	value
	/** @type {FrameProps} */
	defaultProps
	/** @type {string} */
	imprint
	/** @type {number} */
	width
	/** @type {number} */
	height
	/** @type {string} */
	renderMethod
	/**
	 * @param {object} [input]
	 * @param {string[]|string[][]} [input.value]
	 * @param {number} [input.width]
	 * @param {number} [input.height]
	 * @param {string} [input.imprint]
	 * @param {string} [input.renderMethod]
	 * @param {FrameProps} [input.defaultProps]
	 */
	constructor(input = {}) {
		// if (typeOf(Array)(input)) {
		// 	input = { value: input }
		// }
		if (input instanceof Frame) {
			input = { ...input }
		}
		let {
			value = [],
			width = -1,
			height = -1,
			imprint = '',
			renderMethod = 'append',
			defaultProps = new FrameProps(),
		} = input
		if (value instanceof Frame) {
			value = value.value
		}
		if (!typeOf(Array)(value)) {
			throw new TypeError(
				[
					'Frame constructor allows only string[] for rows or string[][] for rows with columns',
					'Provided value:',
					JSON.stringify(value, null, 2),
				].join('\n'),
			)
		}
		value = value.map((row) => {
			if (typeOf(Array)(row)) {
				return row.map(String)
			}
			return [row]
		})
		this.value = value.map((v) => (Array.isArray(v) ? v : [v]))
		this.imprint = String(imprint)
		this.width = width
		this.height = height
		this.renderMethod = renderMethod
		this.defaultProps = defaultProps
	}
	/**
	 * Get whether the frame is empty.
	 * @returns {boolean} True if the frame has no content.
	 */
	get empty() {
		return empty(this.value)
	}
	/**
	 * Calculate the visual width of a string.
	 * @param {string} str
	 * @returns {number} The visual width of the string.
	 */
	lengthOf(str) {
		return stringWidth(str)
	}
	/**
	 * Render the frame into a string representation.
	 * @param {object} [options]
	 * @param {string} [options.method] - Render method to use.
	 * @param {FrameProps} [options.props] - Properties to apply during rendering.
	 * @returns {string} The rendered frame as a string.
	 */
	render(options = {}) {
		const { method = this.renderMethod, props = this.defaultProps } = options
		let rows = this.value.map((row) => {
			if (typeOf(Array)(row)) {
				row = row.join('')
			}
			return row
		})
		let spacesOn = ''
		if (Frame.BOF === rows[0]) {
			rows = rows.slice(1)
			spacesOn = 'top'
		} else if (Frame.BOF === rows[rows.length - 1]) {
			rows = rows.slice(0, -1)
			spacesOn = 'bottom'
		}
		if (this.height >= 0 && rows.length > this.height) {
			rows = rows.slice(0, this.height)
		}
		if (this.width >= 0 && rows.length > 0) {
			rows = rows.map((row) => {
				if (row.length > this.width) {
					row = row.slice(0, this.width)
				}
				return row
			})
		}
		let carret = ''
		if (method === Frame.RenderMethod.REPLACE) {
			const printedRows = rows.map(
				(row) => row + ' '.repeat(Math.max(0, this.width - this.lengthOf(row))),
			)
			const left = this.height >= 0 ? this.height - rows.length : 0
			const eraser = []
			for (let i = 0; i < left; i++) eraser.push(' '.repeat(this.width))
			carret = Frame.BOF
			if ('bottom' === spacesOn) {
				rows = left > 0 ? [...printedRows, ...eraser] : []
			} else {
				rows = left > 0 ? [...eraser, ...printedRows] : []
			}
		} else if (method === Frame.RenderMethod.APPEND) {
			rows = rows.map((row) => {
				const used = this.lengthOf(row)
				const left = Math.max(0, this.width - used)
				row = row + ' '.repeat(left)
				if (row.length > this.width) row = row.slice(0, this.width)
				return row
			})
			if (this.height >= 0 && rows.length > this.height) {
				rows = rows.slice(0, this.height)
			}
			if (spacesOn) {
				carret = Frame.BOF
				const left = this.height >= 0 ? this.height - rows.length : 0
				const eraser = []
				for (let i = 0; i < left; i++) eraser.push('')
				if (spacesOn === 'top') {
					rows = left > 0 ? [...eraser, ...rows] : []
				} else if (spacesOn === 'bottom') {
					rows = left > 0 ? [...rows, ...eraser] : []
				}
			}
		} else if (method === Frame.RenderMethod.VISIBLE) {
			// Move cursor up # lines (Math.max(0, Math.min(rows.length, height))) before rendering
			if (spacesOn) {
				let moveUpLines = Math.max(
					0,
					Math.min(rows.length, this.height >= 0 ? this.height : rows.length),
				)
				if (moveUpLines > 0) {
					--moveUpLines
				}
				carret = Frame.cursorUp(moveUpLines)
			}
			rows = rows.map((row) => Frame.clearLine('\r') + row)
		} else {
			if (spacesOn) {
				carret = Frame.BOF
				const left = this.height >= 0 ? this.height - rows.length : 0
				const eraser = []
				for (let i = 0; i < left; i++) eraser.push('')
				if (spacesOn === 'top') {
					rows = left > 0 ? [...eraser, ...rows] : []
				} else if (spacesOn === 'bottom') {
					rows = left > 0 ? [...rows, ...eraser] : []
				}
			}
		}
		if ('bottom' === spacesOn) {
			this.imprint = rows.join('\n') + carret
		} else {
			this.imprint = carret + rows.join('\n')
		}
		return this.imprint
	}
	#render1(options = {}) {
		const { method = this.renderMethod, props = this.defaultProps } = options

		/**
		 * Helper to apply CLI style codes.
		 * @param {string} str
		 * @param {object} style
		 * @returns {string}
		 */
		function applyStyle(str, style = {}) {
			let out = str
			let prefix = ''
			let suffix = Frame.RESET

			if (style.bold) prefix += Frame.BOLD
			if (style.italic) prefix += Frame.ITALIC
			if (style.underline) prefix += Frame.UNDERLINE
			if (style.strikethrough) prefix += Frame.STRIKETHROUGH

			// Color
			if (style.color) {
				const color = style.color
				if (/^#[0-9a-f]{3,6}$/i.test(color)) {
					// 24-bit color
					const hex = color.replace('#', '')
					const rgb =
						hex.length === 3
							? [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16))
							: [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
					prefix += `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`
				} else if (/^\d+$/.test(color)) {
					prefix += `\x1b[38;5;${color}m`
				} else {
					// Named color, map to 8-bit
					const map = {
						black: 30,
						red: 31,
						green: 32,
						yellow: 33,
						blue: 34,
						magenta: 35,
						cyan: 36,
						white: 37,
						gray: 90,
						grey: 90,
						brightRed: 91,
						brightGreen: 92,
						brightYellow: 93,
						brightBlue: 94,
						brightMagenta: 95,
						brightCyan: 96,
						brightWhite: 97,
					}
					if (map[color]) prefix += `\x1b[${map[color]}m`
				}
			}
			// BgColor
			if (style.bgColor) {
				const color = style.bgColor
				if (/^#[0-9a-f]{3,6}$/i.test(color)) {
					const hex = color.replace('#', '')
					const rgb =
						hex.length === 3
							? [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16))
							: [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
					prefix += `\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m`
				} else if (/^\d+$/.test(color)) {
					prefix += `\x1b[48;5;${color}m`
				} else {
					const map = {
						black: 40,
						red: 41,
						green: 42,
						yellow: 43,
						blue: 44,
						magenta: 45,
						cyan: 46,
						white: 47,
						gray: 100,
						grey: 100,
						brightRed: 101,
						brightGreen: 102,
						brightYellow: 103,
						brightBlue: 104,
						brightMagenta: 105,
						brightCyan: 106,
						brightWhite: 107,
					}
					if (map[color]) prefix += `\x1b[${map[color]}m`
				}
			}
			return prefix ? prefix + out + suffix : out
		}

		/**
		 * Merge style objects, rightmost has priority.
		 * @param  {...object} styles
		 * @returns {object}
		 */
		function mergeStyles(...styles) {
			return Object.assign({}, ...styles)
		}

		/**
		 * Parse cell for value and style.
		 * @param {any} cell
		 * @param {object} inherited
		 * @returns {{text: string, style: object}}
		 */
		function parseCell(cell, inherited = {}) {
			if (typeOf(Array)(cell)) {
				if (cell.length === 2 && typeOf(Object)(cell[1])) {
					return { text: String(cell[0]), style: mergeStyles(inherited, cell[1]) }
				}
				return { text: cell.map((c) => parseCell(c, inherited).text).join(''), style: inherited }
			}
			if (typeOf(Object)(cell)) {
				return { text: '', style: mergeStyles(inherited, cell) }
			}
			if (typeof cell === 'string' && cell.startsWith('<') && cell.endsWith('>')) {
				// Simple XML-like tag parser for <b>, <i>, <u>, <s>, <fg=...>, <bg=...>
				let text = cell
				let style = { ...inherited }
				const tagPattern = /<([bius]|fg|bg)(?:=([#\w\d]+))?>|<\/([bius]|fg|bg)>/gi
				let stack = []
				let result = ''
				let lastIndex = 0
				let m
				while ((m = tagPattern.exec(cell))) {
					result += cell.slice(lastIndex, m.index)
					lastIndex = tagPattern.lastIndex
					if (m[1]) {
						// Opening tag
						let tag = m[1]
						let val = m[2]
						let newStyle = { ...(stack.length ? stack[stack.length - 1] : style) }
						switch (tag) {
							case 'b':
								newStyle.bold = true
								break
							case 'i':
								newStyle.italic = true
								break
							case 'u':
								newStyle.underline = true
								break
							case 's':
								newStyle.strikethrough = true
								break
							case 'fg':
								newStyle.color = val
								break
							case 'bg':
								newStyle.bgColor = val
								break
						}
						stack.push(newStyle)
					} else if (m[3]) {
						// Closing tag
						stack.pop()
					}
				}
				result += cell.slice(lastIndex)
				let finalStyle = stack.length ? stack[stack.length - 1] : style
				return { text: result, style: finalStyle }
			}
			return { text: String(cell), style: inherited }
		}

		// Determine frame-level style
		let frameStyle = {}
		if (
			typeOf(Array)(this.value) &&
			this.value.length &&
			typeOf(Object)(this.value[this.value.length - 1])
		) {
			frameStyle = this.value[this.value.length - 1]
		}

		let rows = this.value
			.filter((row) => !(typeOf(Object)(row) && !typeOf(Array)(row)))
			.map((row) => {
				let rowStyle = frameStyle
				let cells = row
				if (typeOf(Array)(row) && row.length && typeOf(Object)(row[row.length - 1])) {
					rowStyle = mergeStyles(frameStyle, row[row.length - 1])
					cells = row.slice(0, -1)
				}
				if (!typeOf(Array)(cells)) cells = [cells]
				let styled = cells.map((cell) => {
					const { text, style } = parseCell(cell, mergeStyles(props, rowStyle))
					return applyStyle(text, style)
				})
				return styled.join('')
			})

		if (method === FrameRenderMethod.REPLACE) {
			let emptyRows = rows.map((row) => ' '.repeat(this.lengthOf(row)))
			if (rows.length > this.height) {
				emptyRows = emptyRows.slice(0, this.height)
				rows = rows.slice(0, this.height)
			}
			rows = [...emptyRows, Frame.BOF, ...rows]
		} else if (method === FrameRenderMethod.APPEND) {
			rows = rows.map((row) => {
				const used = this.lengthOf(row)
				const left = this.width - used
				row = row + ' '.repeat(Math.max(0, left))
				if (stringWidth(row) > this.width) {
					let acc = ''
					let w = 0
					for (let ch of row) {
						let chW = stringWidth(ch)
						if (w + chW > this.width) break
						acc += ch
						w += chW
					}
					row = acc
				}
				return row
			})
			if (rows.length > this.height) {
				rows = rows.slice(0, this.height)
			}
		} else if (method === FrameRenderMethod.VISIBLE) {
			const moveUpLines = Math.max(
				0,
				Math.min(rows.length, this.height >= 0 ? this.height : rows.length),
			)
			rows = [`\x1b[${moveUpLines}A${Frame.BOF}`, ...rows]
			if (rows.length > this.height && this.height >= 0) {
				rows = rows.slice(0, this.height + 1) // +1 for the cursor move line
			}
		} else {
			if (rows.length > this.height) {
				rows = rows.slice(0, this.height)
			}
			rows = [Frame.BOF, ...rows]
		}

		this.imprint = rows.join('\n')
		return this.imprint
	}
	/**
	 * Convert the frame to its string representation.
	 * @returns {string} The frame's imprint.
	 */
	toString() {
		return this.imprint
	}
	/**
	 * Transform each cell in the frame using a function.
	 * @param {Function} fn - Function to apply to each cell.
	 * @returns {Frame} A new Frame with transformed values.
	 */
	transform(fn) {
		const value = this.value.map((row) => row.map(fn))
		return new Frame({ ...this, value })
	}
	/**
	 * Set the window size for the frame.
	 * @param {number} width - The width of the window.
	 * @param {number} height - The height of the window.
	 */
	setWindowSize(width, height) {
		this.width = Math.max(0, Number(width))
		this.height = Math.max(0, Number(height))
		this.render()
	}
	/**
	 * Check if a value can be used to create a Frame instance.
	 * @param {*} value - Value to check.
	 * @returns {boolean} True if the value is valid for Frame creation.
	 */
	static is(value) {
		try {
			new Frame(value)
			return true
		} catch {
			return false
		}
	}
	/**
	 * Create a Frame instance from input.
	 * @param {*} input - Input value to convert.
	 * @returns {Frame} A new Frame instance.
	 */
	static from(input) {
		if (input instanceof Frame) return input
		if (input?.value instanceof Frame) return new Frame(to(Object)(input.value))
		if ('string' === typeof input) input = [input]
		if (Array.isArray(input)) return new Frame({ value: input })
		return new Frame(input)
	}
	/**
	 * Create a function to space columns based on options.
	 * @param {object} options - Spacing options.
	 * @param {number[]} [options.cols=[]] - Widths of the columns.
	 * @param {number} [options.padding=1] - Padding between columns.
	 * @param {string[]} [options.aligns=[]] - Alignment for each column ('l' or 'r').
	 * @returns {Function} Function that spaces a row.
	 */
	static spaces(options = {}) {
		const { cols = [], padding = 1, aligns = [] } = options
		return (row) =>
			row.map((str, i) => {
				const pad = ' '.repeat(cols[i] - str.length + padding)
				return aligns[i] === 'r' ? pad + str : str + pad
			})
	}
	/**
	 *
	 * @param {Array} arr
	 * @returns {(v) => number[]}
	 */
	static weight(arr) {
		return (Fn = (v) => v) => {
			const cols = []
			arr.forEach((m) => {
				Fn(m).forEach((str, i) => {
					if (undefined === cols[i]) cols[i] = 0
					cols[i] = Math.max(String(str).length, cols[i])
				})
			})
			return cols
		}
	}
	/**
	 *
	 * @param {object} options
	 * @param {Function} [options.fn=(fn = v => v)] - Function to calculate weight.
	 * @param {number[]} [options.cols=[]] - Widths of the columns.
	 * @param {number} [options.padding=1] - The padding between columns.
	 * @param {string[]} [options.aligns=[]] - The column aligns: l, r
	 * @returns {(arr: []) => string[][]}
	 */
	static table(options = {}) {
		const { fn = (v) => v, cols: initialCols = [], padding = 1, aligns = [] } = options
		return (arr) => {
			let cols = initialCols
			if (empty(cols)) {
				cols = Frame.weight(arr)(fn)
			}
			return arr.map((row) => Frame.spaces({ cols, padding, aligns })(row))
		}
	}
	/**
	 * Move cursor up by specified lines.
	 * @param {number} [lines=1] - Number of lines to move up.
	 * @returns {string} ANSI escape code for cursor movement.
	 */
	static cursorUp(lines = 1) {
		return `\x1b[${lines}A`
	}
	/**
	 * Move cursor down by specified lines.
	 * @param {number} [lines=1] - Number of lines to move down.
	 * @returns {string} ANSI escape code for cursor movement.
	 */
	static cursorDown(lines = 1) {
		return `\x1b[${lines}B`
	}
	/**
	 * Clear the current line.
	 * @param {string} [str="\r"] - String to append after clearing.
	 * @returns {string} ANSI escape code for line clearing followed by the string.
	 */
	static clearLine(str = '\r') {
		return Frame.CLEAR_LINE + str
	}
	/**
	 * Clear the entire screen.
	 * @returns {string} ANSI escape codes for screen clearing.
	 */
	static clearScreen() {
		return '\x1b[2J\x1b[0;0H'
	}
}
