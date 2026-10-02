import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { TransformModel } from '../../../../src/domain/models/TransformModel.js'

describe('Release v3.4.0: @nan0web/payload-cms.app Generator Extension', () => {
	it('TransformModel generates groups, tabs, point and relationships', async () => {
		const db = new DB()
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'scratch/test-domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		for await (const intent of transform.run()) {
		}

		const generated =
			(await db.get('/src/collections/ComplexDoc.js')) ||
			(await db.get('src/collections/ComplexDoc.js'))
		assert.ok(generated, 'ComplexDoc.js should be generated')
		assert.ok(generated.includes('"type": "group"'), 'Should contain group field')
		assert.ok(generated.includes('"type": "tabs"'), 'Should contain tabs field')
		assert.ok(generated.includes('"type": "point"'), 'Should contain point field')
	})

	it('TransformModel generates Auth and Drafts configurations', async () => {
		const db = new DB()
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'scratch/test-domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		for await (const intent of transform.run()) {
		}

		const adminGenerated =
			(await db.get('/src/collections/AdminUser.js')) ||
			(await db.get('src/collections/AdminUser.js'))
		assert.ok(adminGenerated, 'AdminUser.js should be generated')
		assert.ok(adminGenerated.includes('auth: true'), 'AdminUser should have auth: true')

		const docGenerated =
			(await db.get('/src/collections/DocPage.js')) || (await db.get('src/collections/DocPage.js'))
		assert.ok(docGenerated, 'DocPage.js should be generated')
		assert.ok(docGenerated.includes('versions: {'), 'DocPage should have versions config')
		assert.ok(docGenerated.includes('drafts: true'), 'DocPage should have drafts: true')
	})

	it('TransformModel generates extended Uploads', async () => {
		const db = new DB()
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'scratch/test-domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		for await (const intent of transform.run()) {
		}

		const generated =
			(await db.get('/src/collections/MediaAsset.js')) ||
			(await db.get('src/collections/MediaAsset.js'))
		assert.ok(generated, 'MediaAsset.js should be generated')
		assert.ok(generated.includes('"mimeTypes"'), 'Should contain mimeTypes config')
		assert.ok(generated.includes('"imageSizes"'), 'Should contain imageSizes config')
	})

	it('TransformModel generates payload.config.js', async () => {
		const db = new DB()
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'scratch/test-domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		for await (const intent of transform.run()) {
		}

		const configCode = (await db.get('payload.config.js')) || (await db.get('/payload.config.js'))
		assert.ok(configCode, 'payload.config.js should be generated')
		assert.ok(configCode.includes('AdminUser'), 'Should import AdminUser collection')
		assert.ok(configCode.includes('SiteConfig'), 'Should import SiteConfig global')
	})
})
