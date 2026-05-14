import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading1 from './MDHeading1.js'

describe('MDHeading1', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading1({ content: 'Main Title' })
		assert.strictEqual(heading.tag, '<h1>')
		assert.strictEqual(heading.mdTag, '# ')
		assert.strictEqual(heading.content, 'Main Title')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading1 markdown', () => {
		const result = MDHeading1.parse('# Hello World')
		assert.ok(result instanceof MDHeading1)
		assert.strictEqual(result.content, 'Hello World')
	})

	it('should return false for invalid heading1 markdown', () => {
		const result = MDHeading1.parse('## Hello World')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading1({ content: 'Sample Heading' })
		assert.strictEqual(String(heading), '# Sample Heading\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading1({ content: 'Sample Heading' })
		assert.strictEqual(heading.toHTML(), '<h1>Sample Heading</h1>')
	})
})
