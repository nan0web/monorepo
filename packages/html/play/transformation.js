#!/usr/bin/env node

import { HTMLTransformer } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

/**
 * Demonstrates basic HTML transformation from nano objects
 * @param {Logger} console
 */
export async function runHTMLTransformationDemo(console) {
	console.clear()
	console.success('Basic HTML Transformation Demo')

	const tr = new HTMLTransformer({ eol: '\n', tab: '\t' })

	const nanoData = {
		div: {
			h1: 'Hello Universe',
			p: 'This is a simple paragraph using nano to HTML transformation',
		},
	}

	console.info('Source nano object:')
	console.info(JSON.stringify(nanoData, null, 2))

	await pressAnyKey(console)

	const html = await tr.encode(nanoData)
	console.info('\nTransformed HTML:')
	console.info(html)

	await pressAnyKey(console)
	console.success('\nBasic transformation demo complete! 🌐')
}
