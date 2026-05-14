#!/usr/bin/env node

import Logger from '@nan0web/log'
import { HTMLTransformer } from '../src/index.js'

const console = new Logger({ level: 'info' })

async function runDemo() {
	console.clear()
	console.success('HTML Playground Demo')

	const transformer = new HTMLTransformer({ eol: '\n', tab: '\t' })
	const nano = {
		div: {
			h1: 'Hello World',
			p: 'This is a paragraph',
		},
	}

	const html = await transformer.encode(nano)
	console.info('Encoded HTML:\n' + html)
}

runDemo().catch((err) => {
	console.error(err)
	process.exit(1)
})
