#!/usr/bin/env node

import { next, pause } from '@nan0web/ui-cli'
import { Parser } from '../src/Parser/index.js'

export async function runParserPlayground(console) {
	console.clear()
	console.success('Parser Playground')
	console.info('Demonstrating indentation-based parsing')

	// Create parser
	const parser = new Parser()

	// Example text
	const exampleText = `root
  child1
    subchild1
    subchild2
  child2
    grandchild1
      great-grandchild
    grandchild2`

	console.info('\nInput text:')
	console.info(exampleText)

	await pause(500)

	// Parse text
	console.info('\nParsing tree structure...')
	const tree = parser.decode(exampleText)

	console.info('\nTree toString output:')
	console.info(String(tree))

	await pause(500)

	// Show tree structure details
	console.info('\nTree structure details:')
	console.info(`Root has ${tree.children.length} child(ren)`)
	if (tree.children[0]) {
		const rootNode = tree.children[0]
		console.info(`Root node content: "${rootNode.content}"`)
		console.info(`Root node has ${rootNode.children.length} child(ren)`)

		rootNode.children.forEach((child, i) => {
			console.info(`  Child ${i + 1}: "${child.content}" (${child.children.length} children)`)
		})
	}

	await pause(500)

	// Encode back
	console.info('\nEncoding tree back to text:')
	const encoded = parser.encode(tree.children[0])
	console.info(encoded)

	console.success('\nParser playground completed! 🌳')

	console.info('\n--- press any key ---')
	await next()
	console.clearLine(console.cursorUp())
}
