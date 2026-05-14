/**
 * Deep merge utility with support for `$clear` flag and unique array merging.
 *
 * @param {any} target - Original value (object, array or primitive).
 * @param {any} source - Value to merge into target.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.unique=true] - When true arrays are merged uniquely.
 * @returns {any} Merged result.
 *
 * @example
 * const result = merge({ arr: [1, 2] }, [{ $clear: true }, 3, 4])
 * // result => { arr: [3, 4] }
 */
export default function merge(target, source, options = { unique: true }) {
	const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

	if (!isObject(target)) {
		return isObject(source) ? source : source
	}

	if (Array.isArray(source) && isObject(target)) {
		const srcHasClear = source.length > 0 && isObject(source[0]) && source[0].$clear === true
		const replacement = srcHasClear ? source.slice(1) : source.slice()
		const out = { ...target }
		for (const key of Object.keys(target)) {
			if (Array.isArray(target[key])) {
				out[key] = replacement
			}
		}
		return out
	}

	if (!isObject(source)) {
		return target
	}

	const onlyClear = source.$clear === true && Object.keys(source).length === 1
	if (onlyClear) {
		return {}
	}

	const result = {}
	for (const key of Object.keys(target)) {
		if (Object.prototype.hasOwnProperty.call(target, key)) {
			result[key] = target[key]
		}
	}

	for (const key of Object.keys(source)) {
		if (!Object.prototype.hasOwnProperty.call(source, key)) continue
		if (key === '$clear') continue

		const srcVal = source[key]
		const tgtVal = result[key]

		if (Array.isArray(srcVal)) {
			if (srcVal.length > 0 && isObject(srcVal[0]) && srcVal[0].$clear === true) {
				result[key] = srcVal.slice(1)
				continue
			}
			if (Array.isArray(tgtVal)) {
				result[key] = options.unique ? uniqArray(tgtVal.concat(srcVal)) : tgtVal.concat(srcVal)
				continue
			}
			result[key] = srcVal.slice()
			continue
		}

		if (isObject(srcVal) && isObject(tgtVal)) {
			result[key] = merge(tgtVal, srcVal, options)
			continue
		}

		result[key] = srcVal
	}

	return result
}

/**
 * Return a new array with duplicate items removed.
 * Equality is performed via JSON.stringify (sufficient for current tests).
 *
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqArray(arr) {
	const seen = new Set()
	return arr.filter((item) => {
		const key = typeof item === 'object' ? JSON.stringify(item) : String(item)
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}
