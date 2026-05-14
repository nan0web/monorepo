import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading4 from './MDHeading4.js'

describe('MDHeading4', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading4({ content: 'Sub-subsection Title' })
		assert.strictEqual(heading.tag, '<h4>')
		assert.strictEqual(heading.mdTag, '#### ')
		assert.strictEqual(heading.content, 'Sub-subsection Title')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading4 markdown', () => {
		const result = MDHeading4.parse('#### Configuration')
		assert.ok(result instanceof MDHeading4)
		assert.strictEqual(result.content, 'Configuration')
	})

	it('should return false for invalid heading4 markdown', () => {
		const result = MDHeading4.parse('##### Configuration')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading4({ content: 'Fourth Level' })
		assert.strictEqual(String(heading), '#### Fourth Level\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading4({ content: 'Fourth Level' })
		assert.strictEqual(heading.toHTML(), '<h4>Fourth Level</h4>')
	})
})
