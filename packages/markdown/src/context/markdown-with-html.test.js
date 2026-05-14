import { describe, it } from 'node:test'
import assert from 'node:assert'
import DB from '@nan0web/db-fs'
import Markdown from '../Markdown.js'

/**
 * Normalizes markdown text for comparison:
 * - removes trailing spaces
 * - removes empty lines
 * - trims leading/trailing whitespace of the whole document
 */
function normalize(md) {
	return md
		.split('\n')
		.map((line) => line.replace(/[ \t]+$/g, '')) // trim end spaces/tabs
		.filter((line) => line.trim().length > 0) // drop blank lines
		.join('\n')
		.trim()
}

describe('markdown-with-html.md', () => {
	/** @type {DB} */
	const db = new DB()

	it('should load and render the document identically (ignoring insignificant whitespace)', async () => {
		const text = await db.loadDocumentAs('.txt', 'src/context/markdown-with-html.md')
		const md = new Markdown()
		md.parse(text)

		// Ensure the parser produced at least one element.
		assert.ok(md.document.children.length > 0)

		const rendered = md.document.toString()
		assert.strictEqual(normalize(rendered), normalize(text))
	})
})
