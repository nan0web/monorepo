/**
 * Extracts and merges static metadata from a class inheritance chain.
 * Traverses from the leaf class up to Model/Object, ensuring child overrides.
 *
 * @param {Function} Class - The class to extract metadata from.
 * @returns {Record<string, any>} - Merged metadata object.
 */
export default function getMetadata(Class) {
	const metadata = {}
	const chain = []
	let current = Class
	while (current && current !== Object && current !== Function.prototype) {
		chain.unshift(current)
		current = Object.getPrototypeOf(current)
	}

	for (const item of chain) {
		const descriptors = Object.getOwnPropertyDescriptors(item)
		for (const key in descriptors) {
			if (key === 'prototype') continue

			const val = item[key]
			if (val && typeof val === 'object') {
				metadata[key] = val
			}
		}
	}

	return metadata
}
