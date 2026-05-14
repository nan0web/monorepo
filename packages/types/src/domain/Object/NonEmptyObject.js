import { notEmpty } from '../../utils/core.js'

/**
 * Base class providing a `toObject` method that omits empty values.
 *
 * @class NonEmptyObject
 */
class NonEmptyObject {
	/**
	 * Convert instance properties to a plain object, skipping empty values.
	 *
	 * @returns {Object} Plain object representation
	 */
	toObject() {
		const result = {}
		for (const key in this) {
			const value = this[key]
			const processed = toPlain(value)
			if (notEmpty(processed)) {
				// @ts-ignore
				result[key] = processed
			}
		}
		return result
	}
}

/**
 * Recursively converts value to plain, skipping empty sub-values.
 *
 * @param {any} value
 * @param {WeakSet} [visited]
 * @returns {any}
 */
function toPlain(value, visited = new WeakSet()) {
	if (value == null || typeof value !== 'object') return value
	if (visited.has(value)) return value // avoid circular refs
	visited.add(value)

	if (Array.isArray(value)) {
		return value.map((item) => toPlain(item, visited)).filter(notEmpty)
	}

	if (value.toObject && typeof value.toObject === 'function') {
		value = value.toObject()
	}

	const result = {}
	for (const key in value) {
		const processed = toPlain(value[key], visited)
		if (notEmpty(processed)) {
			result[key] = processed
		}
	}

	return Object.keys(result).length > 0 ? result : null
}

export default NonEmptyObject
