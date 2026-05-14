import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDHeading1 from './MDHeading1.js'

describe('MDHeading', () => {
	it('MDHeading should create with default level 1', () => {
		const h = new MDHeading1({ content: 'title', tag: '<h1>', end: '</h1>' })
		assert.strictEqual(h.content, 'title')
		assert.strictEqual(h.tag, '<h1>')
		assert.strictEqual(h.end, '</h1>')
	})

	it('MDHeading should create with given content', () => {
		const h = new MDHeading1({ content: 'title' })
		assert.strictEqual(h.content, 'title')
	})
})
