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
		const featuresField = fields.find((f) => f.name === 'features')

		assert.ok(titleField)
		assert.strictEqual(titleField.type, 'text')
		assert.strictEqual(titleField.localized, undefined) // Card.title does not set localized: true explicitly
		assert.ok(featuresField)
		assert.strictEqual(featuresField.type, 'array')
		assert.strictEqual(featuresField.localized, undefined) // Only explicitly localized fields get localized: true
	})
})
