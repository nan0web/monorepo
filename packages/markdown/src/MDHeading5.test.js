import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading5 from './MDHeading5.js'

describe('MDHeading5', () => {
	it('should create instance with correct tag and content', () => {
		const heading = new MDHeading5({ content: 'Minor Section' })
		assert.strictEqual(heading.tag, '<h5>')
		assert.strictEqual(heading.mdTag, '##### ')
		assert.strictEqual(heading.content, 'Minor Section')
		assert.strictEqual(heading.mdEnd, '\n')
	})

	it('should parse valid heading5 markdown', () => {
		const result = MDHeading5.parse('##### Notes')
		assert.ok(result instanceof MDHeading5)
		assert.strictEqual(result.content, 'Notes')
	})

	it('should return false for invalid heading5 markdown', () => {
		const result = MDHeading5.parse('###### Notes')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const heading = new MDHeading5({ content: 'Fifth Level' })
		assert.strictEqual(String(heading), '##### Fifth Level\n')
	})

	it('should convert to HTML string properly', () => {
		const heading = new MDHeading5({ content: 'Fifth Level' })
		assert.strictEqual(heading.toHTML(), '<h5>Fifth Level</h5>')
	})
})
