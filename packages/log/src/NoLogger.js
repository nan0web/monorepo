import Logger from './Logger.js'
import NoConsole from './NoConsole.js'

export default class NoLogger extends Logger {
	/** @type {NoConsole} */
	// @ts-ignore NoConsole does not extend LogConsole to be lighter
	console

	/**
	 * Creates a new NoLogger instance.
	 * @param {import("./Logger.js").LoggerOptions} [options={}] - The options for the logger
	 */
	constructor(options = {}) {
		super({ ...options })
		const { console = new NoConsole() } = options
		this.console = NoConsole.from(console)
	}

	/**
	 * Returns the logged output.
	 * @returns {Array<Array<any>>} The array of logged messages
	 */
	output() {
		return this.console.output()
	}
}
