/**
 * Base spec class for validation and configuration.
 */
export default class Spec {
	/**
	 * @param {Object} input - Input object
	 * @returns {Spec}
	 */
	static from(input) {
		const spec = new this()
		Object.entries(input || {}).forEach(([key, value]) => {
			if (key in spec) spec[key] = value
		})
		return spec
	}

	toJson() {
		return { ...this }
	}
}
