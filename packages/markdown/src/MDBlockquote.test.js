import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDBlockquote from './MDBlockquote.js'

describe('MDBlockquote', () => {
	it('should create instance with correct properties', () => {
		const quote = new MDBlockquote({ content: 'quoted text' })
		assert.strictEqual(quote.tag, '<blockquote>')
		assert.strictEqual(quote.mdTag, '>')
		assert.strictEqual(quote.content, 'quoted text')
		assert.strictEqual(quote.mdEnd, '\n')
		assert.strictEqual(quote.end, '</blockquote>')
	})

	it('should parse single line blockquote correctly', () => {
		const context = { i: 0, rows: ['> single line quote'] }
		const result = MDBlockquote.parse('> single line quote', context)
		assert.ok(result instanceof MDBlockquote)
		assert.strictEqual(result.content, 'single line quote')
	})

	it('should parse multi-line blockquote correctly', () => {
		const context = {
			i: 0,
			rows: ['> first line', '> second line', '> third line'],
		}
		const result = MDBlockquote.parse('> first line', context)
		assert.ok(result instanceof MDBlockquote)
		assert.strictEqual(result.content, 'first line\nsecond line\nthird line')
	})

	it('should return false for invalid blockquote format', () => {
		const result = MDBlockquote.parse('not a quote')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const quote = new MDBlockquote({ content: 'example quote' })
		assert.strictEqual(String(quote), '> example quote\n')
	})

	it('should convert to HTML string properly', () => {
		const quote = new MDBlockquote({ content: 'example quote' })
		assert.strictEqual(quote.toHTML(), '<blockquote>example quote</blockquote>')
	})
})
