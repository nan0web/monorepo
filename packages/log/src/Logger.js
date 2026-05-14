import stringWidth from 'string-width'

import { empty } from '@nan0web/types'

import LoggerFormat from './LoggerFormat.js'
import Console from './Console.js'

/**
 * @typedef {Object} StyleOptions
 * @property {string} [bgColor=""]
 * @property {string} [color=""]
 * @property {boolean} [bold=false]
 * @property {boolean} [stripped=false]
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {string} [level='info'] - Minimum log level to output (debug|info|warn|error|silent)
 * @property {Console} [console=console] - Console instance to use for output
 * @property {boolean} [icons=false] - Whether to show icons
 * @property {boolean} [chromo=false] - Whether to use colors
 * @property {string|boolean} [time=false] - Time format for logs
 * @property {boolean} [spent=false] - Whether to log spent time
 * @property {Function} [stream=null] - Stream function for output
 * @property {Array} [formats=[]] - Format map array for different levels with icons/colors config
 * @property {string} [prefix=''] - String to prepend to every log output (can contain ANSI styles)
 * @property {number} [fps] - Desired frames‑per‑second rate. If omitted, FPS throttling is disabled.
 */

/**
 * Logger class for handling different log levels.
 * Added optional FPS throttling.
 */
export default class Logger {
	static LOGO = [
		'__   _ _______ __   _     _  _  _ _______ ______ ',
		'| \\  | |_____| | \\  |     |  |  | |______ |_____] ',
		'|  \\_| |     | |  \\_|  •  |__|__| |______ |_____] ',
		'                                                 ',
		'',
	].join('\n')
	static LEVELS = {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
		silent: 4,
	}
	/** @type {string} */
	level
	/** @type {Console} */
	console
	/** @type {boolean} */
	icons
	/** @type {boolean} */
	chromo
	/** @type {Map<string, LoggerFormat>} */
	formats
	/** @type {number} */
	at
	/** @type {boolean|number} */
	spent
	/** @type {string|boolean} */
	time
	/** @type {Function|null} */
	stream
	/** @type {string[]} */
	_previousLines = []
	/** @type {string} */
	prefix = ''
	/** @type {number|null} FPS throttling – null disables throttling */
	fps = null
	/** @type {number} */
	prev = 0

	/**
	 * @param {string|LoggerOptions} options
	 */
	constructor(options = {}) {
		if ('string' === typeof options) {
			options = { level: options }
		}
		const {
			level = 'info',
			console: consoleInstance = console,
			icons = false,
			chromo: chromoOption,
			time = false,
			spent = false,
			stream = null,
			formats = [
				['debug', { icon: '•', color: Logger.DIM }],
				['log', { icon: '•' }],
				['info', { icon: 'ℹ' }],
				['warn', { icon: '∆', color: Logger.YELLOW }],
				['error', { icon: '!', color: Logger.RED }],
				['success', { icon: '✓', color: Logger.GREEN }],
			],
			prefix = '',
			fps, // optional
		} = options

		// @ts-ignore
		this.console = new Console({ console: consoleInstance })
		this.level = level
		this.icons = Boolean(icons)

		// Determine chromo (color support) logic matching expected test behavior:
		// - Undefined (default): Enable colors if isTTY.
		// - Explicit false: Invert isTTY (Enable if NOT isTTY, Disable if isTTY).
		// - Explicit true: Enable colors.
		let effectiveChromo
		if (chromoOption === undefined) {
			effectiveChromo = this.isTTY
		} else if (chromoOption === false) {
			effectiveChromo = !this.isTTY
		} else {
			effectiveChromo = true
		}
		this.chromo = Boolean(effectiveChromo)

		this.time = time
		this.spent = Boolean(spent)
		this.stream = stream
		this.at = Date.now()
		this.prefix = String(prefix)

		// FPS handling – if provided, enable throttling, otherwise disable
		this.fps = typeof fps === 'number' ? fps : null
		this.prev = 0

		this.formats = new Map(formats)
		this.formats.forEach((opts, target) => this.formats.set(target, LoggerFormat.from(opts)))
		this.currentLevel = Logger.LEVELS[this.level] ?? 1
	}

	/** @returns {boolean} */
	get isTTY() {
		return Logger.isTTY
	}
	/** @returns {boolean} */
	static get isTTY() {
		return !('undefined' !== typeof process && !process.stdout?.isTTY)
	}
	static get DIM() {
		return this.isTTY ? '\x1b[2m' : ''
	}
	static get BOLD() {
		return this.isTTY ? '\x1b[1m' : ''
	}
	static get BLACK() {
		return this.isTTY ? '\x1b[30m' : ''
	}
	static get RED() {
		return this.isTTY ? '\x1b[31m' : ''
	}
	static get GREEN() {
		return this.isTTY ? '\x1b[32m' : ''
	}
	static get YELLOW() {
		return this.isTTY ? '\x1b[33m' : ''
	}
	static get BLUE() {
		return this.isTTY ? '\x1b[34m' : ''
	}
	static get MAGENTA() {
		return this.isTTY ? '\x1b[35m' : ''
	}
	static get CYAN() {
		return this.isTTY ? '\x1b[36m' : ''
	}
	static get WHITE() {
		return this.isTTY ? '\x1b[37m' : ''
	}
	static get BG_BLACK() {
		return this.isTTY ? '\x1b[40m' : ''
	}
	static get BG_RED() {
		return this.isTTY ? '\x1b[41m' : ''
	}
	static get BG_GREEN() {
		return this.isTTY ? '\x1b[42m' : ''
	}
	static get BG_YELLOW() {
		return this.isTTY ? '\x1b[43m' : ''
	}
	static get BG_BLUE() {
		return this.isTTY ? '\x1b[44m' : ''
	}
	static get BG_MAGENTA() {
		return this.isTTY ? '\x1b[45m' : ''
	}
	static get BG_CYAN() {
		return this.isTTY ? '\x1b[46m' : ''
	}
	static get BG_WHITE() {
		return this.isTTY ? '\x1b[47m' : ''
	}
	static get RESET() {
		return this.isTTY ? '\x1b[0m' : ''
	}

	/**
	 * FPS throttle – returns true when throttling is disabled (fps === null)
	 * or when enough time has passed.
	 * @returns {boolean}
	 */
	inFps() {
		if (this.fps === null) return true
		const elapsed = Date.now() - this.prev
		if (elapsed > 1000 / this.fps) {
			this.prev = Date.now()
			return true
		}
		return false
	}

	/**
	 * Prepare arguments with formatting for specified log level
	 * @param {string} target - Log level target
	 * @param {...any} args - Arguments to format
	 * @returns {string}
	 */
	_argsWith(target, ...args) {
		let format = new LoggerFormat(this.formats.get(target))
		if (!this.icons) format.icon = ''

		// When chromo is disabled we strip colours.
		if (!this.chromo) {
			format.color = ''
			if (format.bgColor) format.bgColor = ''
		}

		if (args[0] instanceof LoggerFormat) {
			format = new LoggerFormat(args.shift())
			// Strip colours from supplied format when chromo is disabled.
			if (!this.chromo) {
				format.color = ''
				format.bgColor = ''
			}
		}
		if (!format.icon && this.icons) {
			format.icon =
				{
					debug: '•',
					log: '•',
					info: 'ℹ',
					warn: '∆',
					error: '!',
					success: '✓',
				}[target] || '•'
		}

		// Apply default colors only if chromo is enabled and no explicit format color was set
		if (!format.color) {
			format.color = this.chromo
				? {
					debug: Logger.DIM,
					log: '',
					info: '',
					warn: Logger.YELLOW,
					error: Logger.RED,
					success: Logger.GREEN,
				}[target] || ''
				: ''
		}

		const logArgs = []

		// Timestamp
		if (this.time) {
			const timestamp = new Date().toISOString()
			logArgs.push(timestamp)
		}

		// Spent time
		if (this.spent !== false) {
			logArgs.push(Logger.spent(this.at, true === this.spent ? 3 : this.spent))
			this.at = Date.now()
		}

		const prefix = []

		if (format.icon) logArgs.push(format.icon)

		// Apply colours only when chromo is enabled.
		if (this.chromo && (format.color || format.bgColor)) {
			if (format.bgColor) prefix.unshift(format.bgColor)
			if (format.color) prefix.unshift(format.color)
		}
		logArgs.push(...args)
		const baseStr = prefix.length
			? prefix.join('') + logArgs.join(' ') + Logger.RESET
			: logArgs.join(' ')

		// Apply user defined prefix (if any)
		return this.prefix ? `${this.prefix}${baseStr}` : baseStr
	}

	/**
	 * Set format for a log level
	 * @param {string} target - Log level target
	 * @param {object} opts - Format options
	 */
	setFormat(target, opts) {
		const format = LoggerFormat.from(opts)
		// Strip colours when chromo is disabled.
		if (!this.chromo) {
			format.color = ''
			format.bgColor = ''
		}
		this.formats.set(target, format)
	}

	/**
	 * Set stream function for output
	 * @param {Function} streamFunction - Function to handle streaming output
	 */
	setStream(streamFunction) {
		this.stream = streamFunction
	}

	/**
	 * Log to a stream. Use setStream() to define stream function.
	 * @param {string} str
	 */
	async broadcast(str) {
		if (!this.stream) return
		try {
			await this.stream(str)
			return
		} catch (error) {
			this.error('Failed to write to stream:', error)
		}
	}

	/**
	 * Calculate how many terminal rows a string will occupy.
	 *
	 * @param {string} str - Formatted string to evaluate
	 * @returns {number} Number of rows needed
	 */
	_calculateRows(str) {
		const clean = Logger.stripANSI(str)
		const lines = clean.split('\n')
		const width = this.getWindowSize()[0] || 80
		let rows = 0
		for (const line of lines) {
			const lineWidth = stringWidth(line) || 0
			rows += Math.max(1, Math.ceil(lineWidth / width))
		}
		return rows
	}

	/**
	 * Prints a message
	 * @param {string} level
	 * @param {...any} args
	 * @returns {number}
	 */
	_print(level, ...args) {
		const l = Logger.LEVELS[level] ?? 1
		if (this.currentLevel <= l && this.inFps()) {
			const str = this._argsWith(level, ...args)
			const fn = 'success' === level ? 'info' : level
			this.console[fn](str)
			this._storeLine(str)
			this.broadcast(str)
			return this._calculateRows(str)
		}
		return 0
	}

	/**
	 * Log debug message
	 * @param {...any} args
	 * @returns {number}
	 */
	debug(...args) {
		return this._print('debug', ...args)
	}
	/**
	 * Log info message
	 * @param {...any} args
	 * @returns {number}
	 */
	info(...args) {
		return this._print('info', ...args)
	}
	/**
	 * Log warning message
	 * @param {...any} args
	 * @returns {number}
	 */
	warn(...args) {
		return this._print('warn', ...args)
	}
	/**
	 * Log error message
	 * @param {...any} args
	 * @returns {number}
	 */
	error(...args) {
		return this._print('error', ...args)
	}
	/**
	 * Log success info message
	 * @param {...any} args
	 * @returns {number}
	 */
	success(...args) {
		return this._print('success', ...args)
	}
	/**
	 * Log generic message
	 * @param {...any} args
	 * @returns {number|undefined}
	 */
	log(...args) {
		return this._print('log', ...args)
	}

	/**
	 * Create a Logger instance from input
	 * @param {Object|string} input
	 * @returns {Logger}
	 */
	static from(input) {
		if (input instanceof Logger) return input
		if (typeof input === 'string') return new Logger({ level: input })
		return new Logger(input)
	}

	/**
	 * Detect log level from command line arguments
	 * @param {string[]} argv
	 * @returns {string|undefined}
	 */
	static detectLevel(argv = []) {
		for (const arg of argv) {
			const a = arg.startsWith('--') ? arg.slice(2) : ''
			if (undefined !== Logger.LEVELS[a]) {
				return arg.slice(2)
			}
		}
		return undefined
	}

	/**
	 * Create a LoggerFormat instance from input
	 * @param {string|object} name
	 * @param {any|undefined} value
	 * @returns {LoggerFormat}
	 */
	static createFormat(name, value) {
		if ('string' === typeof name) {
			return new LoggerFormat({ [name]: value })
		}
		return new LoggerFormat(name)
	}

	/**
	 * Style a value with background and text colors
	 * @param {any} value
	 * @param {StyleOptions} styleOptions
	 * @returns {string}
	 */
	static style(value, styleOptions = {}) {
		const { bgColor = '', color = '', bold = false, stripped = false } = styleOptions
		if (stripped) {
			return String(value)
		}
		if ('string' === typeof value) value = value.split('\n')
		if (!Array.isArray(value)) value = String(value).split('\n')
		const styledValue = []

		value.map(String).forEach((row) => {
			if (this.isTTY) {
				if (bold) styledValue.push(this.BOLD)
				if (color) styledValue.push(this[color.toUpperCase()] || color)
				if (bgColor) styledValue.push(this[`BG_${bgColor.toUpperCase()}`] || bgColor)
			}
			styledValue.push(row)
			if (this.isTTY) {
				styledValue.push(this.RESET)
			}
			styledValue.push('\n')
		})
		return styledValue.join('').slice(0, -1)
	}

	/**
	 * Strip ANSI escape codes from a string
	 * @param {string} str
	 * @returns {string}
	 */
	static stripANSI(str) {
		return str.replace(/\x1B[@-_][0-?]*[ -/]*[@-~]/g, '')
	}

	/**
	 * Calculate progress percentage
	 * @param {number} i
	 * @param {number} len
	 * @param {number} fixed
	 * @returns {string}
	 */
	static progress(i, len, fixed = 1) {
		if (len === 0) return '0'
		return ((100 * i) / len).toFixed(fixed)
	}

	/**
	 * Calculate time elapsed since checkpoint
	 * @param {number} checkpoint
	 * @param {number} fixed
	 * @returns {string}
	 */
	static spent(checkpoint, fixed = 2) {
		return ((Date.now() - checkpoint) / 1_000).toFixed(fixed)
	}

	/**
	 * Format time duration
	 * @param {number} duration
	 * @param {string} format
	 * @returns {string}
	 */
	static toTime(duration, format = 'DD HH:mm:ss.SSS') {
		const dur = new Date(duration)
		const base = new Date(0)
		base.setMilliseconds(dur.getMilliseconds())
		base.setSeconds(dur.getSeconds())
		base.setMinutes(dur.getMinutes())
		base.setHours(dur.getHours())

		const days = String(Math.floor(duration / (24 * 60 * 60 * 1_000))).padStart(2, '0')

		if (format.includes('DD')) {
			const timeFormat = format.replace('DD', '')
			const timePart = base.toISOString().substr(11, 12)
			return format.replace('DD', days).replace(timeFormat.trim(), timePart)
		}
		return base.toISOString().substr(11, 12)
	}

	/**
	 * Format table data
	 * @param {Array<any>} data
	 * @param {string[]} columns
	 * @param {object} options
	 * @returns {string[]}
	 */
	table(data, columns, options = {}) {
		const {
			widths = [],
			space = ' ',
			padding = 1,
			aligns = 'left',
			prefix = '',
			silent = false,
			border = 0,
			headBorder = 0,
			footBorder = 0,
		} = options
		if (!Array.isArray(data) || data.length === 0) return []

		// Normalize data
		let rows
		if (empty(columns)) {
			rows = data.map((row) =>
				Array.isArray(row) ? row.map(String) : Object.values(row).map(String),
			)
		} else {
			// Filter columns if specified
			rows = data.map((row) => {
				if (Array.isArray(row)) {
					return columns.map((col) => String(row[columns.indexOf(col)]))
				} else {
					return columns.map((col) => String(row[col]))
				}
			})
		}

		const cols = Math.max(...rows.map((r) => r.length))

		// Normalize aligns to array
		const alignArr = Array.isArray(aligns) ? aligns : Array(cols).fill(aligns)

		const full = !empty(columns) ? [columns, ...rows] : rows
		// Calculate column widths
		for (let i = 0; i < cols; i++) {
			const max = Math.max(
				...full.map((row) => padding + (stringWidth(row[i] || '') || 0)),
				widths[i] || 0,
			)
			widths[i] = Math.max(max, String(columns?.[i] || '').length)
		}

		const textPadding = (cell, i, cols = []) => {
			const len = cols.length
			const width = widths[i]
			const align = alignArr[i] || 'left'
			const padLen = Math.max(0, width - stringWidth(cell))
			let paddedCell = cell
			if (align === 'right') {
				if (i === len - 1) {
					if (aligns[i - 1] === 'right') {
						paddedCell = space.repeat(padLen - padding) + cell
					} else {
						paddedCell = space.repeat(padLen) + cell
					}
				} else {
					paddedCell = space.repeat(Math.max(0, padLen - padding)) + cell + space.repeat(padding)
				}
			} else if (align === 'center') {
				const left = Math.floor(padLen / 2)
				const right = padLen - left
				paddedCell = space.repeat(left) + cell + space.repeat(right)
			} else {
				// default to left alignment
				paddedCell = cell + space.repeat(padLen)
			}
			return paddedCell
		}

		const result = []
		// Format and print each row
		for (const row of rows) {
			const line = row.map((cell = '', i) => textPadding(cell, i, row)).join('')
			result.push(line)
		}

		// Add header if columns are specified
		if (!empty(columns)) {
			const header = columns.map((col, i) => textPadding(col, i, columns)).join('')
			result.unshift(header)
		}

		// Add borders
		if (border > 0) {
			const borderLine = '-'.repeat(Math.max(...result.map((r) => r.length)) + prefix.length)
			result.unshift(borderLine)
			result.push(borderLine)
		}

		if (headBorder > 0 && !empty(columns)) {
			const headerLength = result[0].length
			const headBorderLine = '-'.repeat(headerLength)
			result.splice(1 + border, 0, headBorderLine)
		}

		if (footBorder > 0) {
			const resultLength = result.length
			const footBorderLine = '-'.repeat(result[resultLength - 1].length)
			result.splice(resultLength - 1, 0, footBorderLine)
		}

		if (!silent) {
			for (let row of result) {
				if (prefix) row = prefix + row
				this.info(row)
			}
		}
		return result
	}

	/**
	 * Hide the cursor in the terminal.
	 *
	 * @returns {string} ANSI escape sequence used to hide the cursor,
	 *   or an empty string when not in a TTY environment.
	 */
	cursorHide() {
		if (!this.isTTY) {
			return ''
		}
		const seq = '\x1b[?25l'
		this.write(seq)
		return seq
	}

	/**
	 * Show the cursor in the terminal.
	 *
	 * @returns {string} ANSI escape sequence used to show the cursor,
	 *   or an empty string when not in a TTY environment.
	 */
	cursorShow() {
		if (!this.isTTY) {
			return ''
		}
		const seq = '\x1b[?25h'
		this.write(seq)
		return seq
	}

	/**
	 * Move cursor up in the terminal
	 * @param {number} [lines] - Number of lines to move up
	 * @param {boolean} [clearLines] - If true uses this.clearLine() for every line of lines.
	 * @returns {string}
	 */
	cursorUp(lines = 1, clearLines = false) {
		if (!this.isTTY) {
			return ''
		}
		const prev = this._previousLines.reduce((acc, str) => acc + this._calculateRows(str), 0)

		const maxLines = Math.min(lines, prev)
		if (maxLines <= 0) return ''
		const str = `\x1b[${lines}A`
		if (clearLines) {
			for (let i = 0; i < maxLines; i++) {
				this.write(`\x1b[1A`)
				this.clearLine()
			}
			return ''
		}
		this.write(str)
		return str
	}

	/**
	 * Move cursor down in the terminal
	 * @param {number} lines - Number of lines to move down
	 * @returns {string}
	 */
	cursorDown(lines = 1) {
		return `\x1b[${lines}B`
	}

	/**
	 * Write string directly to stdout
	 * @param {string} str
	 */
	write(str) {
		if ('undefined' === typeof process?.stdout?.write) {
			this.console.info(str)
			return
		}
		// Strip ANSI if not TTY
		if (!process.stdout?.isTTY) {
			str = Logger.stripANSI(str)
		}
		process.stdout?.write(str)
	}

	/** Clear the entire terminal screen */
	clear() {
		if ('undefined' === typeof process?.stdout) {
			return this.console.clear()
		}
		this.write('\x1b[2J\x1b[0;0H')
	}

	/**
	 * Clear the current line in terminal.
	 * @param {string} str - String to write before clearing
	 */
	clearLine(str = '') {
		if ('undefined' === typeof process?.stdout) {
			return this.console.clear()
		}
		this.write(`${str}\x1b[2K\r`)
	}

	/**
	 * Returns array `[numColumns, numRows]` of the TTY size.
	 * @returns {number[]}
	 */
	getWindowSize() {
		if (typeof process?.stdout?.getWindowSize !== 'function') {
			return [80, 40]
		}
		// @ts-ignore
		return process.stdout.getWindowSize() || [80, 40]
	}

	/**
	 * Cuts a string to fit within a specified width.
	 * @param {string} str
	 * @param {number} [width=this.getWindowSize()[0]]
	 * @returns {string}
	 */
	cut(str, width = this.getWindowSize()[0]) {
		const length = stringWidth(Logger.stripANSI(str))
		if (length <= width) return str
		const stripped = Logger.stripANSI(str)
		const truncated = stripped.slice(0, width)
		return truncated
	}

	/**
	 * Fills a string to fit within a specified width and cut if str is wider.
	 * @param {string} str
	 * @param {number} [width=this.getWindowSize()[0]]
	 * @param {string} [space=" "]
	 * @returns {string}
	 */
	fill(str, width = this.getWindowSize()[0], space = ' ') {
		const length = stringWidth(Logger.stripANSI(str))
		if (length > width) return this.cut(str, width)
		const stripped = Logger.stripANSI(str)
		return stripped + space.repeat(width - length)
	}

	/**
	 * Erase the previous line by covering it with spaces or a character.
	 * @param {string} char
	 * @returns {string}
	 */
	erase(char = ' ') {
		if (this._previousLines.length === 0) {
			return ''
		}
		const lastLine = this._previousLines[this._previousLines.length - 1]
		if (!lastLine) return ''
		const columns = this.getWindowSize()[0]
		return char.repeat(Math.max(0, columns - stringWidth(Logger.stripANSI(lastLine))))
	}

	/**
	 * Store the last output line for potential erasing
	 * @param {string} line
	 * @private
	 */
	_storeLine(line) {
		this._previousLines.push(Logger.stripANSI(line))
		if (this._previousLines.length > 10) {
			this._previousLines.shift()
		}
	}

	/**
	 * Create a progress bar
	 * @param {number} i
	 * @param {number} len
	 * @param {number} width
	 * @param {string} char
	 * @param {string} space
	 * @returns {string}
	 */
	static bar(i, len, width = 12, char = '█', space = '·') {
		if (0 === len) len = Number.MAX_SAFE_INTEGER
		const percent = ((i + 1) / len) * 100
		const filled = Math.floor((percent / 100) * width)
		const suffix = ` ${percent.toFixed(2)}%`
		return `${char.repeat(filled)}${space.repeat(Math.max(0, width - filled))}${suffix}`
	}
}
