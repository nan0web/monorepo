export default class AppCommandOptions {
	/** @type {boolean} */
	webui = false
	/** @type {boolean} */
	json = false
	/** @type {boolean} */
	quiet = false
	/** @type {string} */
	releaseDir = './releases'
	/** @type {boolean} */
	write = false
	/** @type {string} */
	user = 'anonymous'
	/** @type {boolean} */
	ignoreFailTests = false
	/** @type {boolean} */
	full = false

	/**
	 * @param {Object} input
	 */
	constructor(input = {}) {
		Object.assign(this, input)
	}
}
