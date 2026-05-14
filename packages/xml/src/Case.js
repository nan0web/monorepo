/**
 * Utility class providing case transformation methods.
 * @class
 */
class Case {
	/** @type {string} */
	static CAMEL = 'camel'
	/** @type {string} */
	static KEBAB = 'kebab'
	/** @type {string} */
	static SNAKE = 'snake'
	/** @type {string} */
	static PASCAL = 'pascal'
	/** @type {string} */
	static UPPER = 'upper'
	/** @type {string} */
	static LOWER = 'lower'

	/**
	 * Convert a string to camelCase.
	 * @param {string} str - Input string.
	 * @returns {string} Camel‑cased string.
	 */
	static toCamelCase(str) {
		return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase())
	}
	/**
	 * Convert a string to kebab-case.
	 * @param {string} str - Input string.
	 * @returns {string} Kebab‑cased string.
	 */
	static toKebabCase(str) {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
			.replace(/_/g, '-')
			.toLowerCase()
	}
	/**
	 * Convert a string to snake_case.
	 * @param {string} str - Input string.
	 * @returns {string} Snake‑cased string.
	 */
	static toSnakeCase(str) {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
			.replace(/-/g, '_')
			.toLowerCase()
	}
	/**
	 * Convert a string to PascalCase.
	 * @param {string} str - Input string.
	 * @returns {string} Pascal‑cased string.
	 */
	static toPascalCase(str) {
		const camel = Case.toCamelCase(str)
		return camel.charAt(0).toUpperCase() + camel.slice(1)
	}
	/**
	 * Convert a string to UPPERCASE.
	 * @param {string} str - Input string.
	 * @returns {string} Upper‑cased string.
	 */
	static toUpperCase(str) {
		const camel = Case.toCamelCase(str)
		return camel.toUpperCase()
	}
	/**
	 * Convert a string to lowercase.
	 * @param {string} str - Input string.
	 * @returns {string} Lower‑cased string.
	 */
	static toLowerCase(str) {
		return str.toLowerCase()
	}
	/**
	 * Transform a string according to the requested case type.
	 * @param {string} str - Input string.
	 * @param {string} type - One of the {@link Case} static constants.
	 * @returns {string} Transformed string; returns original if type is unknown.
	 */
	static transform(str, type) {
		switch (type) {
			case Case.CAMEL:
				return Case.toCamelCase(str)
			case Case.KEBAB:
				return Case.toKebabCase(str)
			case Case.SNAKE:
				return Case.toSnakeCase(str)
			case Case.PASCAL:
				return Case.toPascalCase(str)
			case Case.UPPER:
				return Case.toUpperCase(str)
			case Case.LOWER:
				return Case.toLowerCase(str)
			default:
				return str
		}
	}
}

export default Case
