import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as mainExport from '../../../../src/index.js'
import { Nan0HTMLFeature } from '../../../../src/richtext/Nan0HTMLFeature.js'
import { PayloadCollectionTemplate } from '../../../../src/templates/PayloadCollectionTemplate.js'

describe('Release v3.3.1: @nan0web/ui-payload Contract', () => {
	it('exports Nan0HTMLFeature and UI cells from main index', () => {
		assert.equal(typeof mainExport.Nan0HTMLFeature, 'function')
		assert.equal(typeof mainExport.ImageCell, 'function')
		assert.equal(typeof mainExport.BooleanCell, 'function')
		assert.equal(typeof mainExport.MapCell, 'function')
		assert.equal(typeof mainExport.accessFor, 'function')
		assert.equal(typeof mainExport.publicAccess, 'function')
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
