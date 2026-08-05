import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Attachment } from '../../../../src/domain/Attachment.js'
import { Article } from '../../../../src/domain/Article.js'
import { BlockRegistry } from '../../../../src/core/BlockRegistry.js'

describe('Release v3.3.0: @nan0web/ui Universal Models & BlockRegistry Contract', () => {
	it('Attachment defines universal upload metadata and fields without Model suffix', () => {
		assert.equal(Attachment.$collection, 'attachments')
		assert.equal(Attachment.$upload, true)
		assert.ok(Attachment.url)
		assert.ok(Attachment.filename)
		assert.ok(Attachment.mimeType)
	})

	it('Article supports text/markdown field type without Model suffix', () => {
		assert.equal(Article.$collection, 'articles')
		assert.equal(Article.content.type, 'text/markdown')
	})

	it('BlockRegistry maps model constructors to components polymorphically without switch/case', () => {
		const registry = new BlockRegistry()
		class MockComponent {}
		registry.register(Attachment, MockComponent)

		assert.equal(registry.get(Attachment), MockComponent)
	})
})
