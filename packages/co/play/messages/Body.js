/**
 * Body – всі опції тепер мають поля зі значенням за замовчуванням
 */
export default class Body {
	static verbose = {
		help: 'Show detailed output',
	}
	/** @type {boolean} */
	verbose = false

	static branch = {
		help: 'Branch to work on',
	}
	/** @type {string} */
	branch = 'main'

	static force = {
		help: 'Force operation',
	}
	/** @type {boolean} */
	force = false

	static help = {
		help: 'Show help',
	}
	/** @type {boolean} */
	help = false

	/**
	 * @param {Partial<Body>} [body={}]
	 */
	constructor(body = {}) {
		const {
			verbose = this.verbose,
			branch = this.branch,
			force = this.force,
			help = this.help,
		} = body

		this.verbose = Boolean(verbose)
		this.branch = String(branch)
		this.force = Boolean(force)
		this.help = Boolean(help)
	}
}
