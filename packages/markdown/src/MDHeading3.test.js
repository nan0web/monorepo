import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading3 from './MDHeading3.js'

describe('MDHeading3', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading3({ content: 'Subsection Title' })
		assert.strictEqual(heading.tag, '<h3>')
		assert.strictEqual(heading.mdTag, '### ')
		assert.strictEqual(heading.content, 'Subsection Title')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading3 markdown', () => {
		const result = MDHeading3.parse('### Details')
		assert.ok(result instanceof MDHeading3)
		assert.strictEqual(result.content, 'Details')
	})

	it('should return false for invalid heading3 markdown', () => {
		const result = MDHeading3.parse('#### Details')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading3({ content: 'Subsection' })
		assert.strictEqual(String(heading), '### Subsection\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading3({ content: 'Subsection' })
		assert.strictEqual(heading.toHTML(), '<h3>Subsection</h3>')
	})
})
