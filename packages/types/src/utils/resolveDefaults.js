import getMetadata from './getMetadata.js'

/**
 * Apply default values from static metadata fields to a target object.
 *
 * @param {Function} Class - The class constructor with static metadata.
 * @param {object} target - The object to apply defaults to (usually `this`).
 * @returns {object} - The target object with defaults applied.
 */
export default function resolveDefaults(Class, target) {
	const metadata = getMetadata(Class)

	for (const [key, meta] of Object.entries(metadata)) {
		let expectedType = meta.type
		if (!expectedType && 'default' in meta && meta.default !== null && meta.default !== undefined) {
			expectedType = typeof meta.default
		}

		if ('default' in meta && target[key] === undefined) {
			target[key] = meta.default
		} else if (target[key] !== undefined && target[key] !== null && expectedType) {
			if (expectedType === 'number') {
				target[key] = target[key] === '' ? 0 : Number(target[key])
			} else if (expectedType === 'string') {
				target[key] = String(target[key])
			} else if (expectedType === 'boolean') {
				if (target[key] === 'false' || target[key] === '0') target[key] = false
				else if (target[key] === 'true' || target[key] === '1') target[key] = true
				else target[key] = Boolean(target[key])
			}
		}
	}
	return target
}
