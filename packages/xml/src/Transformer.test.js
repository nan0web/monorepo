import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import XMLTransformer from './Transformer.js'
import XMLTags from './XMLTags.js'

describe('XMLTransformer', () => {
	it('should create instance with default options', () => {
		const transformer = new XMLTransformer()
		assert.equal(transformer.tab, '\t')
		assert.equal(transformer.eol, '\n')
		assert.ok(transformer.defaultTags instanceof XMLTags)
	})

	it('should create instance with custom options', () => {
		const customOptions = {
			tab: '  ',
			eol: '\r\n',
			defaultTags: new XMLTags(),
		}
		const transformer = new XMLTransformer(customOptions)
		assert.equal(transformer.tab, '  ')
		assert.equal(transformer.eol, '\r\n')
		assert.ok(transformer.defaultTags instanceof XMLTags)
	})

	it('should encode data to XML', async () => {
		const transformer = new XMLTransformer()
		const data = { note: 'Hello World' }
		const xml = await transformer.encode(data)
		assert.equal(xml, '<note>Hello World</note>')
	})

	it('should decode XML to nano object', async () => {
		const transformer = new XMLTransformer()
		const xmlString = '<note>Hello World</note>'
		const result = await transformer.decode(xmlString)
		assert.deepStrictEqual(result, { note: 'Hello World' })
	})
})
