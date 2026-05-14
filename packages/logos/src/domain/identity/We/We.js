import I from '../I/I.js'

class We {
	/** @type {I[]} */
	members
	/**
	 * @param {object} input
	 * @param {I[]} [input.members]
	 */
	constructor(input = {}) {
		const { members = [] } = input
		this.members = members.map((m) => I.from(m))
	}
	toString() {
		return this.members.join('\n')
	}
}

export default We
