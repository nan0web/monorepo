#!/usr/bin/env node

/**
 * Transformer that adds a prefix during encoding
 * and removes it during decoding.
 */
export class PrefixTransformer {
	/**
	 * @param {string} prefix - Prefix to use
	 */
	constructor(prefix = '[ENC]') {
		this.prefix = String(prefix)
	}

	/**
	 * Encodes data with prefix
	 * @param {string} data - Input data
	 * @returns {Promise<string>} Prefixed result
	 */
	encode = async (data) => {
		return `${this.prefix} ${data}`
	}

	/**
	 * Decodes data by removing prefix
	 * @param {string} data - Input data
	 * @returns {Promise<string>} Result without prefix
	 */
	decode = async (data) => {
		const escaped = this.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const regex = new RegExp(`^${escaped}\\s*`)
		return String(data).replace(regex, '')
	}
}

/**
 * Demonstrates prefix-based transformation
 * @param {object} console - Logger instance
 */
export async function runPrefixDemo(console) {
	console.clear()
	console.success('Prefix Transformer Demo')

	const transformer = new (await import('../src/index.js')).Transformer()

	const prefixTransformer = new PrefixTransformer('[SECRET]')
	transformer.addTransformer(prefixTransformer)

	const input = 'confidential message'
	console.info(`Input: "${input}"`)

	const encoded = await transformer.encode(input)
	console.info(`Encoded: "${encoded}"`)

	const decoded = await transformer.decode(encoded)
	console.info(`Decoded: "${decoded}"`)

	if (input !== decoded) {
		throw new Error('Decoded value should match original input')
	}
	console.success('✓ Prefix transformer worked as expected')
}
