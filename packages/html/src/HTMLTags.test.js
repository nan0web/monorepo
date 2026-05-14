import { describe, it } from 'node:test'
import assert from 'node:assert'
import HTMLTags from './HTMLTags.js'

describe('HTMLTags utility class', () => {
	const tags = new HTMLTags()

	it('should return proper closing for non‑empty tags', () => {
		const result = tags.$selfClosed('script')
		assert.equal(result, '></script>')
	})

	it('should return simple closing for empty tags', () => {
		const result = tags.$selfClosed('div')
		assert.equal(result, '>')
	})

	it('should map shortcut "." to "class"', () => {
		assert.equal(tags.$tagAttrs['.'], 'class')
	})

	it('should map shortcut "#" to "id"', () => {
		assert.equal(tags.$tagAttrs['#'], 'id')
	})

	it('should expose default tag for unordered list items', () => {
		assert.equal(tags.ul, 'li')
	})

	it('should expose default tag for ordered list items', () => {
		assert.equal(tags.ol, 'li')
	})
})
