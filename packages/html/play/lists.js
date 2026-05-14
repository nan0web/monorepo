#!/usr/bin/env node

import { HTMLTransformer } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

/**
 * Demonstrates proper list rendering with ul/ol
 * @param {Logger} console
 */
export async function runHTMLListRenderingDemo(console) {
	console.clear()
	console.success('List Rendering (ul/ol) Demo')

	const tr = new HTMLTransformer({ eol: '', tab: '' })

	const unorderedListData = [
		{
			ul: [
				'First item',
				'Second item',
				{
					li: ['Nested item', { strong: 'with bold text' }],
				},
				'Fourth item',
			],
		},
	]

	console.info('Unordered list source:')
	console.info(JSON.stringify(unorderedListData, null, 2))

	await pressAnyKey(console)

	const ulHtml = await tr.encode(unorderedListData)
	console.info('\nRendered unordered list:')
	console.info(ulHtml)

	await pressAnyKey(console)

	const orderedListData = [
		{
			ol: [
				'First step',
				'Second step',
				{
					li: ['Sub-step', { em: 'with emphasis' }],
				},
				'Final step',
			],
		},
	]

	console.info('\nOrdered list source:')
	console.info(JSON.stringify(orderedListData, null, 2))

	await pressAnyKey(console)

	const olHtml = await tr.encode(orderedListData)
	console.info('\nRendered ordered list:')
	console.info(olHtml)

	validateListStructure(ulHtml, olHtml)
	console.success('\nList rendering demo complete! ✅')
}

/**
 * Validates proper list structure rendering
 * @param {string} ulHtml
 * @param {string} olHtml
 */
function validateListStructure(ulHtml, olHtml) {
	if (
		!ulHtml.includes(
			'<ul><li>First item</li><li>Second item</li><li>Nested item<strong>with bold text</strong></li><li>Fourth item</li></ul>',
		)
	) {
		throw new Error('Unordered list rendering incorrect')
	}
	if (
		!olHtml.includes(
			'<ol><li>First step</li><li>Second step</li><li>Sub-step<em>with emphasis</em></li><li>Final step</li></ol>',
		)
	) {
		throw new Error('Ordered list rendering incorrect')
	}
}
