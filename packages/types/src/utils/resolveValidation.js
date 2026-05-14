import getMetadata from './getMetadata.js'
import ModelError from '../domain/ModelError.js'

/**
 * Validate values of a target object against static metadata rules.
 *
 * @param {Function} Class - The class constructor with static metadata fields.
 * @param {object} target - The object whose properties should be validated.
 * @returns {boolean} - Returns true if validation passes.
 * @throws {ModelError} - Throws a ModelError with all validation failures.
 */
export default function resolveValidation(Class, target) {
	const fields = {}
	const metadata = getMetadata(Class)

	for (const [key, meta] of Object.entries(metadata)) {
		if (typeof meta.validate === 'function') {
			const result = meta.validate(target[key])
			if (true === result) continue

			if (false === result) {
				fields[key] = ["Validation failed for property '{key}'", { key }]
			} else {
				fields[key] = result
			}
		}
	}

	if (Object.keys(fields).length > 0) {
		throw new ModelError(fields)
	}

	return true
}
