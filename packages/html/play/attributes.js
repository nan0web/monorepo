#!/usr/bin/env node

import { HTMLTransformer } from '../src/index.js'
import { pressAnyKey } from './simple-demos.js'

/**
 * Demonstrates HTML attributes and class rendering
 * @param {Logger} console
 */
export async function runHTMLAttributesDemo(console) {
	console.clear()
	console.success('HTML Attributes & Classes Demo')

	const tr = new HTMLTransformer({ eol: '', tab: '' })

	const data = [
		{
			'div.d-flex.flex-column#container': [
				{ 'span.text-bold': 'Bold text' },
				{ 'a.btn.btn-primary#link': { $href: '#', $target: '_blank', text: 'Primary Button' } },
				{ 'img#logo': { $src: 'logo.png', $alt: 'Logo', $width: '100', $height: '100' } },
			],
		},
	]

	console.info('Source with attributes and classes:')
	console.info(JSON.stringify(data, null, 2))

	await pressAnyKey(console)

	const html = await tr.encode(data)
	console.info('\nRendered HTML:')
	console.info(html)

	assertValidAttributeRendering(html)
	console.success('\nAttributes rendering demo complete! 🎯')
}

/**
 * Basic validation of attribute rendering
 * @param {string} html
 */
function assertValidAttributeRendering(html) {
	if (!html.includes('class="d-flex flex-column"')) {
		throw new Error('Missing combined classes in container')
	}
	if (!html.includes('id="container"')) {
		throw new Error('Missing id attribute in container')
	}
	if (!html.includes('href="#"')) {
		throw new Error('Missing href attribute in link')
	}
	if (!html.includes('target="_blank"')) {
		throw new Error('Missing target attribute in link')
	}
	if (!html.includes('src="logo.png"')) {
		throw new Error('Missing src attribute in image')
	}
}
