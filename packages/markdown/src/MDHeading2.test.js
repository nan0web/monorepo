import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading2 from './MDHeading2.js'

describe('MDHeading2', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading2({ content: 'Section Title' })
		assert.strictEqual(heading.tag, '<h2>')
		assert.strictEqual(heading.mdTag, '## ')
		assert.strictEqual(heading.content, 'Section Title')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading2 markdown', () => {
		const result = MDHeading2.parse('## Features')
		assert.ok(result instanceof MDHeading2)
		assert.strictEqual(result.content, 'Features')
	})

	it('should return false for invalid heading2 markdown', () => {
		const result = MDHeading2.parse('# Features')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading2({ content: 'New Section' })
		assert.strictEqual(String(heading), '## New Section\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading2({ content: 'New Section' })
		assert.strictEqual(heading.toHTML(), '<h2>New Section</h2>')
	})
})
