import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHorizontalRule from './MDHorizontalRule.js'

describe('MDHorizontalRule', () => {
	it('should create instance with correct properties', () => {
		const hr = new MDHorizontalRule()
		assert.strictEqual(hr.tag, '<hr>')
		assert.strictEqual(hr.mdTag, '---')
		assert.strictEqual(hr.content, '')
		assert.strictEqual(hr.mdEnd, '\n')
		assert.strictEqual(hr.end, '')
	})

	it('should parse horizontal rule correctly', () => {
		const result = MDHorizontalRule.parse('---')
		assert.ok(result instanceof MDHorizontalRule)
	})

	it('should return false for invalid horizontal rule', () => {
		const result = MDHorizontalRule.parse('--')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const hr = new MDHorizontalRule()
		assert.strictEqual(String(hr), '---\n')
	})

	it('should convert to HTML string properly', () => {
		const hr = new MDHorizontalRule()
		assert.strictEqual(hr.toHTML(), '<hr>')
	})
})
