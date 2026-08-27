import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Card } from '../../../3rdparty/industrialbank/cards/src/domain/models/Card.js'
import { TransformModel } from '../domain/models/TransformModel.js'




describe('Card Model to Payload Collection Transformation', () => {
	it('transforms Card.js model into Payload JS CollectionConfig with explicit localized fields', async () => {
		const transformer = new TransformModel()
		const staticFields = {}
		for (const [k, v] of Object.entries(Card)) {
			if (!k.startsWith('$') && k !== 'UI' && k !== 'length' && k !== 'name' && k !== 'prototype') {
				staticFields[k] = v
			}
		}

		const fields = Object.entries(staticFields).map(([k, v]) => transformer.transformField(k, v))
		const titleField = fields.find((f) => f.name === 'title')
		const imageField = fields.find((f) => f.name === 'image')
		const typeField = fields.find((f) => f.name === 'type')
		const orderField = fields.find((f) => f.name === 'order')
		const hiddenField = fields.find((f) => f.name === 'hidden')
		const featuresField = fields.find((f) => f.name === 'features')

		const categoriesField = fields.find((f) => f.name === 'categories')

		assert.ok(titleField)
		assert.strictEqual(titleField.type, 'text')
		assert.strictEqual(titleField.localized, true)
		assert.strictEqual(imageField.type, 'upload')
		assert.strictEqual(imageField.relationTo, 'media')
		assert.deepStrictEqual(typeField.admin, { position: 'sidebar' })
		assert.deepStrictEqual(imageField.admin, { position: 'sidebar' })
		assert.deepStrictEqual(orderField.admin, { position: 'sidebar' })
		assert.strictEqual(hiddenField.admin.position, 'sidebar')
		assert.ok(featuresField)
		assert.strictEqual(featuresField.type, 'array')
		assert.strictEqual(featuresField.localized, true)
		assert.ok(categoriesField)
		assert.strictEqual(categoriesField.type, 'relationship')
		assert.strictEqual(categoriesField.relationTo, 'card-categories')
		assert.strictEqual(categoriesField.hasMany, true)
	})

	it('transforms CardCategory.js model into Payload JS CollectionConfig', async () => {
		const { CardCategory } = await import('../../../3rdparty/industrialbank/cards/src/domain/models/CardCategory.js')
		const transformer = new TransformModel()
		const staticFields = {}
		for (const [k, v] of Object.entries(CardCategory)) {
			if (!k.startsWith('$') && k !== 'UI' && k !== 'length' && k !== 'name' && k !== 'prototype') {
				staticFields[k] = v
			}
		}

		const fields = Object.entries(staticFields).map(([k, v]) => transformer.transformField(k, v))
		const titleField = fields.find((f) => f.name === 'title')
		const slugField = fields.find((f) => f.name === 'slug')

		assert.ok(titleField)
		assert.strictEqual(titleField.type, 'text')
		assert.strictEqual(titleField.localized, true)
		assert.strictEqual(titleField.required, true)
		assert.ok(slugField)
		assert.strictEqual(slugField.type, 'text')
		assert.strictEqual(slugField.required, true)
	})
})
