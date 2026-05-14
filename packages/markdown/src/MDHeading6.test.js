import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading6 from './MDHeading6.js'

describe('MDHeading6', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading6({ content: 'Smallest Section' })
		assert.strictEqual(heading.tag, '<h6>')
		assert.strictEqual(heading.mdTag, '###### ')
		assert.strictEqual(heading.content, 'Smallest Section')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading6 markdown', () => {
		const result = MDHeading6.parse('###### References')
		assert.ok(result instanceof MDHeading6)
		assert.strictEqual(result.content, 'References')
	})

	it('should return false for invalid heading6 markdown', () => {
		const result = MDHeading6.parse('# References')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading6({ content: 'Sixth Level' })
		assert.strictEqual(String(heading), '###### Sixth Level\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading6({ content: 'Sixth Level' })
		assert.strictEqual(heading.toHTML(), '<h6>Sixth Level</h6>')
	})
})
