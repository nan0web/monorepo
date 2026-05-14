class LoggerFormat {
	/** @type {string} */
	icon
	/** @type {string} */
	color
	/** @type {string} */
	bgColor
	constructor(input = {}) {
		const { icon = '', color = '', bgColor = '' } = input
		this.icon = String(icon)
		this.color = String(color)
		this.bgColor = String(bgColor)
	}
	/**
	 * @param {object} input
	 * @returns {LoggerFormat}
	 */
	static from(input) {
		if (input instanceof LoggerFormat) return input
		return new LoggerFormat(input)
	}
}

export default LoggerFormat
