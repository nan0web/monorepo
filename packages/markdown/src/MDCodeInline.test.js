import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDCodeInline from './MDCodeInline.js'

describe('MDCodeInline', () => {
	it('should create instance with correct properties', () => {
		const code = new MDCodeInline({ content: 'console.log()' })
		assert.strictEqual(code.tag, '<code>')
		assert.strictEqual(code.mdTag, '`')
		assert.strictEqual(code.content, 'console.log()')
		assert.strictEqual(code.mdEnd, '`')
		assert.strictEqual(code.end, '</code>')
	})

	it('should parse inline code correctly', () => {
		const result = MDCodeInline.parse('`inline code`')
		assert.ok(result instanceof MDCodeInline)
		assert.strictEqual(result.content, 'inline code')
	})

	it('should return false when no inline code found', () => {
		const result = MDCodeInline.parse('not inline code')
		assert.strictEqual(result, false)
	})

	it('should handle inline code with spaces', () => {
		const result = MDCodeInline.parse('` code with spaces `')
		assert.ok(result instanceof MDCodeInline)
		assert.strictEqual(result.content, ' code with spaces ')
	})

	it('should convert to markdown string properly', () => {
		const code = new MDCodeInline({ content: 'test' })
		assert.strictEqual(String(code), '`test`')
	})

	it('should convert to HTML string properly', () => {
		const code = new MDCodeInline({ content: 'test' })
		assert.strictEqual(code.toHTML(), '<code>test</code>')
	})
})
