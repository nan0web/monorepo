/**
 * Plain model without any UI‑specific extensions.
 *
 * The form for this model will be generated automatically from its properties.
 */
export default class SimpleUser {
	/**
	 * @param {Object} data
	 * @param {string} [data.name]
	 * @param {string} [data.email]
	 * @param {number | null} [data.age]
	 */
	constructor({ name = "", email = "", age = null } = {}) {
		this.name = name
		this.email = email
		this.age = age !== null ? Number(age) : null
	}
}
