import { BooleanFormat } from './BooleanFormat.js'
import { StringFormat } from './StringFormat.js'
import { NumberFormat } from './NumberFormat.js'
import { FormatResolver, defaultResolver } from '../FormatResolver.js'

export const BuiltinFormats = {
	boolean: BooleanFormat,
	string: StringFormat,
	number: NumberFormat,
}

export { FormatResolver, defaultResolver }

/**
 * Resolves a format instance by name or package specifier.
 * @param {string | Function | object} type
 * @param {any} [options]
 * @returns {import('../Format.js').Format}
 */
export function resolveFormat(type, options = {}) {
	return defaultResolver.resolveSync(type, options)
}
