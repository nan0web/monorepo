#!/usr/bin/env node

import NaN0 from '../src/NaN0.js'
import { next, pause } from '@nan0web/ui-cli'

export async function runNANOPlayground(console) {
	console.clear()
	console.success('NANO Format Playground')
	console.info('Demonstrating .nano format parsing, stringifying and comment handling')

	// Example data
	const exampleData = {
		'array when empty': [],
		'array when have values': [
			{
				name: 'Some values',
			},
			160000500.345,
			'multiple line\nstring\nonly with the | no other symbols are available',
		],
		'object when empty': {},
		'object when have values': {
			'name as a one line string': 'One line, possible with "',
			'name as a one line with quotes': '"Only double quotes are possible " escaped quotes"',
			'string as a multiline': 'only with the | char,\nno other symbols',
			'numeric value': 160000500,
			'float value': 160000500.345,
			'negative number': -160000500.345,
			'boolean true': true,
			'boolean false': false,
			'null value': null,
		},
	}

	// Show original data
	console.info('\nOriginal data:')
	console.info(JSON.stringify(exampleData, null, 2))

	await pause(500)

	// Stringify with NANO (no comments)
	console.info('\nStringified with NANO:')
	const nanoString = NaN0.stringify(exampleData)
	console.info(nanoString)

	await pause(500)

	// Parse back with NANO and capture comments
	console.info('\nParsed back with NANO (capturing comments):')
	const parseContext = { comments: [] }
	const parsedData = NaN0.parse(nanoString, parseContext)
	console.info(JSON.stringify(parsedData, null, 2))

	if (parseContext.comments.length) {
		console.info('\nCaptured comments:')
		console.info(JSON.stringify(parseContext.comments, null, 2))
	}

	await pause(500)

	// Test with arrays – also capture comments
	const arrayExample = ['Item 1', 'Item 2', { nested: 'object' }]
	console.info('\nArray example:')
	console.info('Original:', JSON.stringify(arrayExample))
	const arrayString = NaN0.stringify(arrayExample)
	console.info('\nStringified array:')
	console.info(arrayString)

	const arrayParseContext = { comments: [] }
	const parsedArray = NaN0.parse(arrayString, arrayParseContext)
	console.info('\nParsed array back:')
	console.info(JSON.stringify(parsedArray, null, 2))

	if (arrayParseContext.comments.length) {
		console.info('\nArray comments captured:')
		console.info(JSON.stringify(arrayParseContext.comments, null, 2))
	}

	console.success('\nNANO playground completed! 🧬')

	console.info('\n--- press any key ---')
	await next()
	console.clearLine(console.cursorUp())
}
