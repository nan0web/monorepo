import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fromNan0Html, Nan0HTMLFeature, accessFor, publicAccess } from './index.js'
import { PayloadCollectionTemplate } from './templates/PayloadCollectionTemplate.js'

describe('ProvenDoc: @nan0web/ui-payload', () => {
	/**
	 * @docs
	 * # @nan0web/ui-payload
	 *
	 * Universal Payload CMS UI Components & Schema Generators.
	 */
	it('provides clean server exports and template generator', async () => {
		assert.equal(typeof Nan0HTMLFeature, 'function')
		assert.equal(typeof fromNan0Html, 'function')
		assert.equal(typeof accessFor, 'function')
		assert.equal(typeof publicAccess, 'function')

		const tpl = new PayloadCollectionTemplate({
			collectionSlug: 'demo',
		})
		const code = await tpl.compile()
		assert.ok(code.includes("collectionSlug = 'demo'"))
	})
})
