import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Release v3.4.2: @nan0web/ui-payload Contract', () => {
	it('root package can be cleanly imported in Node.js without JSX syntax or resolution errors', async () => {
		const mod = await import('../../../../src/index.js')
		assert.ok(mod, 'Root module must resolve')
		assert.equal(typeof mod.Nan0HTMLFeature, 'function')
		assert.equal(typeof mod.accessFor, 'function')
		assert.equal(typeof mod.publicAccess, 'function')
		assert.equal(typeof mod.fromNan0Html, 'function')
	})

	it('package exports access subpath cleanly', async () => {
		const accessMod = await import('../../../../src/access.js')
		assert.equal(typeof accessMod.accessFor, 'function')
		assert.equal(typeof accessMod.publicAccess, 'function')
	})

	it('package exports templates cleanly', async () => {
		const tplMod = await import('../../../../src/templates/PayloadCollectionTemplate.js')
		assert.equal(typeof tplMod.PayloadCollectionTemplate, 'function')
		const instance = new tplMod.PayloadCollectionTemplate({ collectionSlug: 'demo' })
		const code = await instance.compile()
		assert.ok(code.includes("collectionSlug = 'demo'"))
	})

	it('PayloadApp throws localized error when neither payload nor config is provided', async () => {
		const { PayloadApp } = await import('../../../../src/domain/PayloadApp.js')
		const app = new PayloadApp({}, { t: (k, params) => `LOCALIZED: ${params.alias}` })
		await assert.rejects(
			async () => {
				await app.getPayloadInstance()
			},
			{
				name: 'Error',
				message: 'LOCALIZED: PayloadApp',
			}
		)
	})
})
