import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDParagraph from './MDParagraph.js'

describe('MDParagraph', () => {
	it('should create instance', () => {
		const p = new MDParagraph({ content: 'text', tag: '<p>', end: '</p>' })
		assert.strictEqual(p.content, 'text')
		assert.strictEqual(p.tag, '<p>')
		assert.strictEqual(p.end, '</p>')
		assert.deepStrictEqual(p.children, [])
	})

	it('should properly parse inline code within paragraph', () => {
		const input = '`DB.path.test.js` is a test suite from the base `DB` class.'
		const elements = [new MDParagraph({ content: input })]

		// Test that inline code is detected during stringification
		const output = elements[0].toString()
		assert.ok(output.includes('`DB.path.test.js`'))
		assert.ok(output.includes('`DB`'))
	})

	it('should properly stringify inline code within paragraphs', () => {
		const paragraph = new MDParagraph({
			content:
				'`DB.path.test.js` is a test suite from the base `DB` class.\nI think it should be covered the same way.',
		})
		const stringified = paragraph.toString()
		assert.ok(stringified.includes('`DB.path.test.js` is a test suite from the base `DB` class.'))
		assert.ok(stringified.includes('I think it should be covered the same way.'))
	})

	it('should properly parse and stringify complex inline elements', () => {
		const input = 'This paragraph contains `inline code` and also [links](https://example.com).'
		const elements = [new MDParagraph({ content: input })]
		const output = elements[0].toString()
		assert.ok(output.includes('`inline code`'))
	})
})
