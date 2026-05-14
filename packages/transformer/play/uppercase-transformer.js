#!/usr/bin/env node

/**
 * Transformer that converts text to uppercase during encoding
 * and to lowercase during decoding.
 */
export const UpperCaseTransformer = {
	/**
	 * Encodes data to uppercase
	 * @param {string} data - Input data
	 * @returns {Promise<string>} Uppercase result
	 */
	encode: async (data) => {
		return String(data).toUpperCase()
	},

	/**
	 * Decodes data to lowercase
	 * @param {string} data - Input data
	 * @returns {Promise<string>} Lowercase result
	 */
	decode: async (data) => {
		return String(data).toLowerCase()
	},
}

/**
 * Demonstrates basic case transformation
 * @param {object} console - Logger instance
 */
export async function runUpperCaseDemo(console) {
	console.clear()
	console.success('Uppercase Transformer Demo')

	const transformer = new (await import('../src/index.js')).Transformer()

	console.info('Adding uppercase transformer...')
	transformer.addTransformer(UpperCaseTransformer)

	const input = 'hello world'
	console.info(`Input: "${input}"`)

	const encoded = await transformer.encode(input)
	console.info(`Encoded: "${encoded}"`)

	const decoded = await transformer.decode(encoded)
	console.info(`Decoded: "${decoded}"`)

	if (input.toLowerCase() !== decoded) {
		throw new Error('Decoded value should match original input')
	}
	console.success('✓ Uppercase transformer worked as expected')
}
