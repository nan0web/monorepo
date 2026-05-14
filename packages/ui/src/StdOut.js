import { typeOf } from '@nan0web/types'
import EventProcessor from '@nan0web/event/oop'

/**
 * Handles standard output stream with formatting capabilities.
 */
class StdOut extends EventProcessor {
	/** @type {string} End of line character */
	static EOL = '\n'

	/** @type {string} Beginning of line character */
	static BOL = '\r'

	/** @type {string} Reset formatting escape code */
	static RESET = '\x1b[0m'

	/** @type {string} Clear screen escape code */
	static CLEAR = '\x1b[2J\x1b[H'

	/** @type {object} Color escape codes */
	static COLORS = {
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		gray: '\x1b[90m',
		black: '\x1b[30m',
	}

	/** @type {Record<string, string>} Style escape codes */
	static STYLES = {
		dim: '\x1b[2m',
		bold: '\x1b[1m',
		underline: '\x1b[4m',
	}

	/**
	 * @todo define go top by rows constants.
	 */

	/** @type {string[]} Output stream buffer */
	stream = []

	/** @type {number[]} Window size [width, height] */
	windowSize = []

	/** @type {any} Output processor */
	processor

	/**
	 * Creates a new StdOut instance.
	 * @param {object} props - StdOut properties
	 * @param {any} [props.processor] - Output processor
	 * @param {string[]} [props.stream=[]] - Initial output stream
	 * @param {number[]} [props.windowSize=[144, 33]] - Window size [width, height]
	 */
	constructor(props = {}) {
		super()
		const { processor, stream = [], windowSize = [144, 33] } = props
		this.processor = processor
		this.stream = stream
		this.windowSize = windowSize
	}

	/**
	 * Writes output to the output stream.
	 * Must be overwritten by other apps.
	 * @param {any} output - Output to write
	 * @param {Function} onError - Error handler callback
	 */
	write(output, onError = (v) => 1) {
		/**
		 * @todo manage the
		 */
		if (typeOf(Array)(output)) {
			output = output.join('\n')
		}
		this.stream.push(output)
		this.processor?.write(output, onError)
		this.emit('data', output)
	}

	/**
	 * Gets the window size.
	 * @returns {number[]} Window size [width, height]
	 */
	getWindowSize() {
		return this.processor?.getWindowSize?.() ?? this.windowSize
	}
}

export default StdOut
