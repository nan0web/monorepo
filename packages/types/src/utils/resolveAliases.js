import getMetadata from './getMetadata.js'

/**
 * Universal alias resolution for Model-as-Schema classes.
 *
 * @param {Function} Class - The class constructor with static metadata.
 * @param {object} input - Input data object.
 * @returns {object} - Processed data with aliases resolved.
 */
export default function resolveAliases(Class, input) {
	const data = { ...input }
	const metadata = getMetadata(Class)

	for (const [key, meta] of Object.entries(metadata)) {
		if (meta.alias) {
			const aliases = Array.isArray(meta.alias) ? meta.alias : [meta.alias]
			for (const alias of aliases) {
				if (alias in data && !(key in data)) {
					data[key] = data[alias]
					delete data[alias]
					break
				}
			}
		}
	}

	return data
}
