import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Nan0HTMLFeature } from '../../../../src/richtext/Nan0HTMLFeature.js'
import { PayloadCollectionTemplate } from '../../../../src/templates/PayloadCollectionTemplate.js'
import { accessFor, publicAccess } from '../../../../src/access.js'

describe('Release v3.4.1: @nan0web/ui-payload Contract', () => {
	it('exports server helpers and features correctly', () => {
		assert.equal(typeof Nan0HTMLFeature, 'function')
		assert.equal(typeof accessFor, 'function')
		assert.equal(typeof publicAccess, 'function')
	})

	it('Nan0HTMLFeature returns a valid feature descriptor', () => {
		const feat = Nan0HTMLFeature()
		assert.ok(feat)
		assert.equal(typeof feat.key, 'string')
		assert.equal(feat.key, 'nan0html')
	})

	it('PayloadCollectionTemplate compiles cleanly', async () => {
		const tpl = new PayloadCollectionTemplate({
			collectionSlug: 'test',
		})
		const code = await tpl.compile()
		assert.ok(code.includes("const collectionSlug = 'test'"))
	})
})
