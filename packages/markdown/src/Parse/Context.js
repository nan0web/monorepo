export default class ParseContext {
	/** @type {number} */
	i = 0
	/** @type {number} */
	j = 0

	/** @type {string[]} */
	rows = []

	/** @type {Array} */
	skipped = []

	/**
	 * @param {object} input
	 * @param {number} [input.i=0] The row position
	 * @param {number} [input.j=0] The column position
	 * @param {string[]} [input.rows] The rows
	 * @param {Array} [input.skipped] The skipped rows
	 */
	constructor(input = {}) {
		const { i = 0, j = 0, rows = [], skipped = [] } = input
		this.i = Number(i)
		this.j = Number(j)
		this.rows = rows
		this.skipped = skipped
	}
}
