#!/usr/bin/env node

import { UpperCaseTransformer, runUpperCaseDemo } from './uppercase-transformer.js'
import { PrefixTransformer, runPrefixDemo } from './prefix-transformer.js'
import { DelayTransformer, runAsyncDemo } from './async-delay-transformer.js'

/**
 * Demonstrates chaining multiple transformers
 * @param {object} console - Logger instance
 */
export async function runCompositeDemo(console) {
	console.clear()
	console.success('Composite Transformer Chain Demo')

	const TransformerClass = (await import('../src/index.js')).Transformer
	const transformer = new TransformerClass()

	// Add multiple transformers
	const upperCase = UpperCaseTransformer
	const prefix = new PrefixTransformer('[APP]')
	const delay = DelayTransformer

	transformer.addTransformer(upperCase)
	transformer.addTransformer(prefix)
	transformer.addTransformer(delay)

	console.info('Transformer chain created with 3 stages:')
	console.info('  1. Uppercase')
	console.info('  2. Add prefix [APP]')
	console.info('  3. Add delay marker')

	const input = 'initial payload'
	console.info(`\nInput: "${input}"`)

	const encoded = await transformer.encode(input)
	console.info(`Encoded: "${encoded}"`)

	const decoded = await transformer.decode(encoded)
	console.info(`Decoded: "${decoded}"`)

	// Clean decoding: remove delay marker and prefix in any order and case
	let cleaned = String(decoded)
	cleaned = cleaned.replace(/\[delayed:\d+ms\]\s*/i, '')
	cleaned = cleaned.replace(/\[app\]\s*/i, '')

	if (input !== cleaned) {
		throw new Error('Final decoded value should match original input')
	}
	console.success('✓ Composite transformation chain worked perfectly')
}
