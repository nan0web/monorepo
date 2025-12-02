import Logger from "@nan0web/log"

/**
 * @typedef {Object} createProgressOptions
 * @property {number} [startTime=Date.now()]
 * @property {number} [fps=30]
 */

/**
 * Create a progress function with interval of FPS.
 * @param {({ startTime, elapsed }) => void} fn
 * @param {createProgressOptions} param1
 * @returns {NodeJS.Timeout}
 */
export function createProgress(fn, { startTime = Date.now(), fps = 30 }) {
	return setInterval(() => {
		const elapsed = Date.now() - startTime
		fn({ startTime, elapsed })
	}, 1e3 / fps)
}

/**
 * @typedef {Object} OutputProgressInput
 * @property {Logger} [logger] Logger instance as a console processor
 * @property {number} [maxLines=3] Number of lines to print out
 * @property {string[]} [chunks=[]] Array of chunks to print out
 * @property {number} [fps=30] Frames per second
 * @property {number} [printed=0] Recent printed amount of lines
 */

/**
 * @param {OutputProgressInput} input
 * @returns {NodeJS.Timeout}
 */
export function createOutputProgress(input) {
	const {
		logger,
		maxLines = 3,
		chunks = [],
		fps = 30,
	} = input

	let printed = input.printed || 0
	const clear = () => {
		if (logger && printed > 0) logger.cursorUp(printed)
	}

	/** @param {number} elapsed */
	const print = (elapsed) => {
		const lines = chunks.join("\n").split("\n").filter(Boolean)
		const tail = lines.slice(-maxLines)
		const time = `  ${Number(elapsed / 1e3).toFixed(2)}s`
		printed = tail.length || 1
		input.printed = printed

		if (logger) {
			// Primary line (with time)
			logger.info(logger.fill(`${time}  ${tail[0] ?? ""}`))
			// Additional lines, if any – output the raw text (no extra formatting)
			const prefix = " ".repeat(time.length) + "  "
			tail.slice(1).forEach(t => logger.info(logger.fill(prefix + t)))
		}
	}

	if (chunks.length) print(0)

	return createProgress(({ elapsed }) => {
		clear()
		print(elapsed)
	}, { fps })
}

/**
 * Pause execution for a given number of milliseconds.
 *
 * @param {number} [ms=1_000] - Milliseconds to wait, 1,000 is default.
 * @returns {Promise<void>} A promise that resolves after the timeout.
 *
 * @example
 *   await pause(10); // pauses for ~10 ms
 */
export function pause(ms = 1e3) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
