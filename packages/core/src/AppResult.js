/**
 * Unified application result format
 * Used for both UI responses and logging
 *
 * @class
 * @property {string[]} content - Result content lines
 * @property {number} priority - Result priority level
 * @property {object} meta - Result metadata
 * @property {Error|null} error - Error object if any
 */
export default class AppResult {
	/**
	 * Create an AppResult instance
	 * @param {object} input - Result data
	 * @param {string[]|string} input.content - Result content as string or array of strings
	 * @param {number} [input.priority=0] - Priority level (higher number means higher priority)
	 * @param {object} [input.meta={}] - Additional result metadata
	 * @param {Error|null} [input.error=null] - Error object if the result represents an error
	 */
	constructor({ content, priority = 0, meta = {}, error = null }) {
		/** @type {string[]} */
		this.content = Array.isArray(content) ? content : [content]
		/** @type {number} */
		this.priority = priority
		/** @type {object} */
		this.meta = meta
		/** @type {Error|null} */
		this.error = error
	}

	/**
	 * Create AppResult from input data
	 * @param {object|AppResult} input - Input data or existing AppResult instance
	 * @returns {AppResult} AppResult instance
	 */
	static from(input) {
		if (input instanceof AppResult) return input
		return new AppResult(input)
	}
}
