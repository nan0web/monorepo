import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDLink from './MDLink.js'

describe('MDLink', () => {
	it('should create instance with correct properties', () => {
		const link = new MDLink({ content: 'link text', href: 'https://example.com' })
		assert.strictEqual(link.tag, '<a')
		assert.strictEqual(link.mdTag, '[')
		assert.strictEqual(link.content, 'link text')
		assert.strictEqual(link.href, 'https://example.com')
		assert.strictEqual(link.mdEnd, '](')
		assert.strictEqual(link.end, '</a>')
	})

	it('should parse markdown link correctly', () => {
		const context = { i: 0, rows: [] }
		const result = MDLink.parse('[link text](https://example.com)', context)
		assert.ok(result instanceof MDLink)
		assert.strictEqual(result.content, 'link text')
		assert.strictEqual(result.href, 'https://example.com')
	})

	it('should return false for invalid link format', () => {
		const result = MDLink.parse('not a link')
		assert.strictEqual(result, false)
	})

	it('should handle empty link text', () => {
		const context = { i: 0, rows: [] }
		const result = MDLink.parse('[](https://example.com)', context)
		assert.ok(result instanceof MDLink)
		assert.strictEqual(result.content, '')
		assert.strictEqual(result.href, 'https://example.com')
	})

	it('should convert to markdown string properly', () => {
		const link = new MDLink({ content: 'Example', href: 'https://example.com' })
		assert.strictEqual(String(link), '[Example](https://example.com)')
	})

	it('should convert to HTML string properly', () => {
		const link = new MDLink({ content: 'Example', href: 'https://example.com' })
		assert.strictEqual(link.toHTML(), '<a href="https://example.com">Example</a>')
	})
})
