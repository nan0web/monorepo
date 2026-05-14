#!/usr/bin/env node

/**
 * Transformer that adds delay during transformation
 * to simulate async operations.
 */
export const DelayTransformer = {
	/**
	 * Encodes data with delay
	 * @param {string} data - Input data
	 * @param {number} [ms=10] - Delay in milliseconds
	 * @returns {Promise<string>} Result after delay
	 */
	encode: async (data, ms = 10) => {
		await new Promise((resolve) => setTimeout(resolve, ms))
		return `[DELAYED:${ms}ms] ${data}`
	},

	/**
	 * Decodes data by removing delay marker
	 * @param {string} data - Input data
	 * @returns {Promise<string>} Clean result
	 */
	decode: async (data) => {
		return String(data).replace(/\[DELAYED:\d+ms\]\s*/, '')
	},
}

/**
 * Demonstrates asynchronous transformation with delay
 * @param {object} console - Logger instance
 */
export async function runAsyncDemo(console) {
	console.clear()
	console.success('Async Delay Transformer Demo')

	const transformer = new (await import('../src/index.js')).Transformer()

	console.info('Adding async delay transformer...')
	transformer.addTransformer(DelayTransformer)

	const input = 'real-time data'
	console.info(`Input: "${input}"`)

	const start = performance.now()
	const encoded = await transformer.encode(input)
	const end = performance.now()

	console.info(`Encoded: "${encoded}"`)
	console.info(`Processing time: ${(end - start).toFixed(1)}ms`)

	const decoded = await transformer.decode(encoded)
	console.info(`Decoded: "${decoded}"`)

	if (input !== decoded) {
		throw new Error('Decoded value should match original input')
	}
	console.success('✓ Async transformer worked as expected')
}
