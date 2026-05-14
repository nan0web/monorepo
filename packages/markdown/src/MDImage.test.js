import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDImage from './MDImage.js'

describe('MDImage', () => {
	it('should create instance with correct properties', () => {
		const image = new MDImage({ content: 'alt text', src: 'image.png' })
		assert.strictEqual(image.tag, '<img')
		assert.strictEqual(image.mdTag, '!')
		assert.strictEqual(image.content, 'alt text')
		assert.strictEqual(image.src, 'image.png')
		assert.strictEqual(image.mdEnd, ' ')
		assert.strictEqual(image.end, '>')
	})

	it('should parse markdown image correctly', () => {
		const context = { i: 0, rows: [] }
		const result = MDImage.parse('![alt text](image.png)', context)
		assert.ok(result instanceof MDImage)
		assert.strictEqual(result.content, 'alt text')
		assert.strictEqual(result.src, 'image.png')
	})

	it('should return false for invalid image format', () => {
		const result = MDImage.parse('not an image')
		assert.strictEqual(result, false)
	})

	it('should handle empty alt text', () => {
		const context = { i: 0, rows: [] }
		const result = MDImage.parse('![](image.png)', context)
		assert.ok(result instanceof MDImage)
		assert.strictEqual(result.content, '')
		assert.strictEqual(result.src, 'image.png')
	})

	it('should convert to markdown string properly', () => {
		const image = new MDImage({ content: 'Graph', src: 'chart.svg' })
		assert.strictEqual(String(image), '![Graph](chart.svg) ')
	})

	it('should convert to HTML string properly', () => {
		const image = new MDImage({ content: 'Graph', src: 'chart.svg' })
		assert.strictEqual(image.toHTML(), '<img src="chart.svg" alt="Graph">')
	})
})
