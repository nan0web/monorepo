import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Markdown from '../../../../../Markdown.js'

describe('v3.0.0 release contract', () => {
	it('Markdown constructor accepts a string and parses immediately', () => {
		const md = new Markdown('# Direct String')
		const html = md.stringify()
		assert.ok(html.includes('<h1>Direct String</h1>'), "HTML has direct string")
	})
})
