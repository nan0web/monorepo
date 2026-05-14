import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading from './MDHeading.js'

describe('MDHeading', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading({ content: 'Main Title' })
		assert.strictEqual(typeof MDHeading.defaultMdTag, 'function')
		assert.strictEqual(heading.mdTag(heading), '# ')
		assert.strictEqual(heading.content, 'Main Title')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading1 markdown', () => {
		const result = MDHeading.parse('# Hello World')
		assert.ok(result instanceof MDHeading)
		assert.strictEqual(result.content, 'Hello World')
		assert.strictEqual(result.heading, 1)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading({ content: 'Sample Heading' })
		assert.strictEqual(String(heading), '# Sample Heading\n')
	})

	it('should convert h2 to markdown string properly', () => {
		const heading = new MDHeading({ content: 'Sample Heading', mdTag: '## ' })
		assert.strictEqual(String(heading), '## Sample Heading\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading({ content: 'Sample Heading' })
		assert.strictEqual(heading.toHTML(), '<h1>Sample Heading</h1>')
		assert.strictEqual(heading.toString(), '# Sample Heading\n')
	})
})
