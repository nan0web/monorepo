import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import { Logger as BaseLogger, NoConsole, NoLogger as BaseNoLogger } from './index.js'

class Logger extends BaseLogger {
	constructor(options = {}) {
		if ('string' === typeof options) {
			options = { level: options }
		}
		super({ ...options, console: new NoConsole({ silent: false }) })
	}
	get isTTY() {
		return true
	}
	static get isTTY() {
		return true
	}
	write(str) {
		this.console.info(str)
	}

	/**
	 * Returns captured logs with preserved structure.
	 * @param {string | Function | null} type The type to filter
	 * @returns {Array<Array<string, any[]>>}
	 */
	output(type = null) {
		return this.console.console.output(type)
	}
}

class NoLogger extends BaseNoLogger {
	get isTTY() {
		return false
	}
}

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach((info) => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/log
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * A cross-platform Logger class that wraps console methods for both Node.js and browsers
	 * with consistent interface and streaming support.
	 *
	 * ## Description
	 *
	 * The `@nan0web/log` package provides a minimal yet powerful foundation for logging systems.
	 * Core classes:
	 *
	 * - `Logger` — main logger class with levels, icons, colors, time and streaming support
	 * - `LogConsole` — wraps console methods for consistent cross-platform logging
	 * - `LoggerFormat` — defines format for a logger level with icon, color and background
	 * - `NoLogger` — captures logs in memory, perfect for testing
	 * - `NoConsole` — captures console output in memory, perfect for testing
	 *
	 * These classes are perfect for building CLI tools, debugging layers, structured logs,
	 * and streaming data to files or external services.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/log
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/log')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/log
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/log')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/log
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/log')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Logger
	 *
	 * Logger can be instantiated with a level or options and logs everything below that level
	 */
	it('How to create a Logger instance with level?', () => {
		//import Logger from '@nan0web/log'
		const logger = new Logger('debug')
		logger.info(typeof logger.debug) // ← function
		logger.info(logger.level) // ← debug
		assert.equal(logger.output()[0][1], 'function')
		assert.equal(logger.output()[1][1], 'debug')
	})
	/**
	 * @docs
	 */
	it('How to create a Logger instance with options?', () => {
		//import Logger from '@nan0web/log'
		const logger = new Logger({
			level: 'info',
			icons: true,
			chromo: true,
			time: true,
		})
		logger.info('Hello with options') // ← TIME-HH-IIT... ℹ Hello with options
		assert.ok(logger)
		const output = logger.output()[0][1]
		assert.ok(output.endsWith(' ℹ Hello with options'))
		assert.ok(output.match(/^\d{4}-\d{2}-\d{2}T/))
	})

	/**
	 * @docs
	 * ### Custom Formats
	 *
	 * Logger supports custom formats for different levels
	 */
	it('How to use custom formats for different levels?', () => {
		//import Logger from '@nan0web/log'
		const logger = new Logger({
			level: 'debug',
			icons: true,
			formats: [
				['debug', { icon: '🔍', color: Logger.CYAN }],
				['info', { icon: 'ℹ️ ', color: Logger.GREEN }],
				['warn', { icon: '⚠️ ', color: Logger.YELLOW }],
				['error', { icon: '❌', color: Logger.RED }],
				['success', { icon: '✅', color: Logger.GREEN }],
			],
		})
		logger.debug('Debug message') // ← \x1b[36m🔍 Debug message
		logger.info('Info message') // ← \x1b[32mℹ️  Info message
		logger.warn('Warning message') // ← \x1b[33m⚠️  Warning message
		logger.error('Error message') // ← \x1b[31m❌ Error message
		logger.success('Success message') // ← \x1b[32m✅ Success message
		assert.ok(logger)
		const logs = logger.output()
		assert.deepStrictEqual(logs, [
			['debug', '\x1b[36m🔍 Debug message'],
			['info', '\x1b[32mℹ️  Info message'],
			['warn', '\x1b[33m⚠️  Warning message'],
			['error', '\x1b[31m❌ Error message'],
			['info', '\x1b[32m✅ Success message'],
		])
		assert.ok(logs[0][1].includes('🔍'))
		assert.ok(logs[1][1].includes('ℹ️ '))
		assert.ok(logs[2][1].includes('⚠️ '))
		assert.ok(logs[3][1].includes('❌'))
		assert.ok(logs[4][1].includes('✅'))
	})

	/**
	 * @docs
	 * ### Streaming Logs
	 *
	 * Logger supports streaming logs to files or external services
	 */
	it('How to stream logs to a file?', async () => {
		//import Logger from '@nan0web/log'
		let streamOutput = ''
		const logger = new Logger({
			stream: async (message) => {
				streamOutput += message
			},
		})
		logger.broadcast('Streamed message')
		// Wait a bit for async operations
		await new Promise((resolve) => setTimeout(resolve, 10))
		console.log(streamOutput) // ← Streamed message
		assert.equal(streamOutput, 'Streamed message')
	})

	/**
	 * @docs
	 * ### Memory Logging with NoLogger
	 *
	 * NoLogger captures logs in memory instead of printing them, perfect for testing
	 */
	it('How to capture logs in memory with NoLogger?', () => {
		//import { NoLogger } from '@nan0web/log'
		const logger = new NoLogger({ level: 'debug' })
		logger.debug('Debug message')
		logger.info('Info message')
		logger.warn('Warning message')
		logger.error('Error message')
		logger.success('Success message')
		const logs = logger.output()
		console.log(logs) // ← [ [ "debug", "Debug message" ], [ "info", "Info message" ], ... ]
		assert.equal(logs.length, 5)
		assert.deepStrictEqual(logs, [
			['debug', 'Debug message'],
			['info', 'Info message'],
			['warn', 'Warning message'],
			['error', 'Error message'],
			['info', 'Success message'],
		])
	})

	/**
	 * @docs
	 * ### Advanced Features
	 *
	 * Logger includes useful helpers for formatting, tables, progress, etc.
	 */
	it('How to create and display formatted tables?', () => {
		//import Logger from '@nan0web/log'
		const logger = new Logger()
		const data = [
			{ name: 'John', age: 30, city: 'New York' },
			{ name: 'Jane', age: 25, city: 'Los Angeles' },
			{ name: 'Bob', age: 35, city: 'Chicago' },
		]
		// Capture table output by mocking console methods
		logger.table(data, ['name', 'age', 'city'], { padding: 2, border: 1 })
		// ------------------------
		// name  age  city
		// John  30   New York
		// Jane  25   Los Angeles
		// Bob   35   Chicago
		// ------------------------
		assert.equal(
			logger
				.output()
				.map(([type, info]) => info)
				.join('\n'),
			[
				'------------------------',
				'name  age  city         ',
				'John  30   New York     ',
				'Jane  25   Los Angeles  ',
				'Bob   35   Chicago      ',
				'------------------------',
			].join('\n'),
		)
	})

	/**
	 * @docs
	 */
	it('How to style text with colors and background?', () => {
		//import Logger from '@nan0web/log'
		const styled = Logger.style('Styled text', {
			color: Logger.MAGENTA,
			bgColor: Logger.BG_WHITE,
		})
		console.info(styled) // ← \x1b[35m\x1b[47mStyled text\x1b[0m
		assert.ok(console.output()[0][1].includes('Styled text'))
		assert.ok(console.output()[0][1].includes(Logger.MAGENTA))
		assert.ok(console.output()[0][1].includes(Logger.BG_WHITE))
	})

	/**
	 * @docs
	 * ### Work with cursor and clear lines for progress
	 *
	 * Demonstrates moving the cursor, moving it down, and clearing a line.
	 *
	 * The logger methods return the ANSI escape sequences, which you can log
	 * directly. Each call creates a separate log entry.
	 */
	it('How to work with cursor and clear lines for progress?', () => {
		const logger = new Logger()
		// Log a multiline message
		logger.info('Need to add first lines\nto let cursor move up')
		// Log the cursor‑up escape sequence – this is a separate log entry
		logger.cursorUp(2, true)
		// Log the clear‑line escape sequence – a separate entry as well
		logger.info(logger.clearLine())
		assert.deepStrictEqual(logger.output(), [
			['info', 'Need to add first lines\nto let cursor move up'],
			// cursorUp(2, true)
			['info', '\x1b[1A'],
			['info', '\x1b[2K\r'],
			['info', '\x1b[1A'],
			['info', '\x1b[2K\r'],
			// logger.clearLine()
			['info', '\x1b[2K\r'],
			['info', ''],
		])
	})

	/**
	 * @docs
	 * ### Prefix Option
	 *
	 * Logger can prepend a custom prefix to every log line.
	 */
	it('How to use Logger.prefix option?', () => {
		const logger = new Logger({ prefix: 'PREFIX> ' })
		logger.info('Message with prefix') // ← PREFIX> Message with prefix
		assert.equal(logger.output()[0][1], 'PREFIX> Message with prefix')
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### Logger
	 *
	 * * **Properties**
	 *   * `level` – minimum log level to output (debug|info|warn|error|silent)
	 *   * `console` – Console instance used for output
	 *   * `icons` – whether to show icons
	 *   * `chromo` – whether to apply colors
	 *   * `time` – format for timestamps (default: false)
	 *   * `spent` – whether to log execution time differences (default: false)
	 *   * `stream` – function for output streaming (default: null)
	 *   * `formats` – map of formats for different log levels
	 *
	 * * **Methods**
	 *   * `debug(...args)` – log debug message
	 *   * `info(...args)` – log info message
	 *   * `warn(...args)` – log warning message
	 *   * `error(...args)` – log error message
	 *   * `success(...args)` – log success message (uses info channel)
	 *   * `log(...args)` – log generic message
	 *   * `setFormat(target, opts)` – set format for a log level
	 *   * `setStream(streamFunction)` – define stream function for output
	 *   * `table(data, columns, options)` – format and log table data
	 *   * `write(str)` – write string directly to stdout
	 *   * `cursorUp(lines)` – move cursor up in terminal
	 *   * `cursorDown(lines)` – move cursor down in terminal
	 *   * `clear()` – clear the console
	 *   * `clearLine()` – clear the current line
	 *   * `getWindowSize()` – get terminal size [columns, rows]
	 *   * `cut(str, width)` – cut string to terminal width
	 *   * `static from(input)` – create Logger instance from string or options
	 *   * `static detectLevel(argv)` – detect log level from command line args
	 *   * `static createFormat(name, value)` – create LoggerFormat from input
	 *   * `static style(value, styleOptions)` – style a value with colors
	 *   * `static stripANSI(str)` – remove ANSI codes from string
	 *   * `static progress(i, len, fixed)` – calculate progress percentage
	 *   * `static spent(checkpoint, fixed)` – calculate time since checkpoint
	 *   * `static bar(i, len, width, char, space)` – create progress bar string
	 *
	 * ### LogConsole
	 *
	 * * **Properties**
	 *   * `console` – the underlying console instance
	 *   * `prefix` – prefix data for every log
	 *
	 * * **Methods**
	 *   * `debug(...args)` – log debug message
	 *   * `info(...args)` – log info message
	 *   * `warn(...args)` – log warning message
	 *   * `error(...args)` – log error message
	 *   * `log(...args)` – log generic message
	 *   * `clear()` – clear the console
	 *   * `assert(condition, ...args)` – assert a condition
	 *   * `count(label)` – log count of calls with label
	 *   * `countReset(label)` – reset counter for label
	 *   * `dir(obj)` – display object properties
	 *   * `dirxml(obj)` – display object tree
	 *   * `group(...args)` – create inline group
	 *   * `groupCollapsed(...args)` – create collapsed group
	 *   * `groupEnd()` – exit current group
	 *   * `profile(label)` – start profile
	 *   * `profileEnd(label)` – end profile
	 *   * `time(label)` – start timer
	 *   * `timeStamp(label)` – log timestamp
	 *   * `timeEnd(label)` – stop timer and log elapsed time
	 *   * `timeLog(label)` – log current timer value
	 *   * `table(data, columns)` – display tabular data
	 *   * `trace()` – log stack trace
	 *
	 * ### LoggerFormat
	 *
	 * * **Properties**
	 *   * `icon` – icon string
	 *   * `color` – ANSI color code
	 *   * `bgColor` – ANSI background color code
	 *
	 * * **Methods**
	 *   * `static from(input)` – create format from object or existing instance
	 *
	 * ### NoLogger
	 *
	 * Extends `Logger`.
	 *
	 * * **Properties**
	 *   * `console` – NoConsole instance that captures output
	 *
	 * * **Methods**
	 *   * `output()` – return captured logs
	 *
	 * ### NoConsole
	 *
	 * * **Properties**
	 *   * `silent` – whether to suppress all output
	 *
	 * * **Methods**
	 *   * `debug(...args)` – capture debug log
	 *   * `info(...args)` – capture info log
	 *   * `warn(...args)` – capture warning log
	 *   * `error(...args)` – capture error log
	 *   * `log(...args)` – capture generic log
	 *   * `clear()` – clear captured logs
	 *   * `output(type)` – return captured logs (all or filtered by type)
	 *   * `static from(input)` – create or return NoConsole instance
	 *
	 * ## Java•Script
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/log.git
		 * cd log
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	const text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(String(text).includes('## License'))
	})
})
