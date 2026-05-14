import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import XMLTags from './XMLTags.js'

describe('XMLTags', () => {
	it('default properties', () => {
		const tags = new XMLTags()
		assert.equal(tags.$default, 'element')
		assert.equal(tags.books, 'book')
		assert.equal(tags.library, 'section')
	})

	it('$selfClosed handling', () => {
		const tags = new XMLTags()
		assert.equal(tags.$selfClosed('note'), '></note>')
		assert.equal(tags.$selfClosed('?xml'), '?>')
	})
})
