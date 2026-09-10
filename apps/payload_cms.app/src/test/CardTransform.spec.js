import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Model } from '@nan0web/types'
import { TransformModel } from '../domain/models/TransformModel.js'

class DummyFeature extends Model {
	static $collection = 'features'
	static $slug = 'features'

	static title = {
		help: 'Feature title',
		default: '',
		localized: true,
		required: true,
	}
}

class DummyCategory extends Model {
	static $collection = 'categories'
	static $slug = 'categories'

	static title = {
		help: 'Category title',
		default: '',
		localized: true,
		required: true,
	}

	static slug = {
		help: 'Category slug',
		default: '',
		required: true,
	}
}

class DummyProduct extends Model {
	static title = { help: 'Product title', default: '', localized: true }
	static type = {
		help: 'Product type',
		default: '',
		admin: { position: 'sidebar' },
	}
	static image = { help: 'Product image', default: '', type: 'media', admin: { position: 'sidebar' } }
	static order = { help: 'Display order', default: 0, type: 'integer', admin: { position: 'sidebar' } }
	static hidden = { help: 'Is hidden', default: false, type: 'boolean', admin: { position: 'sidebar' } }
	static features = { help: 'Product features', default: [], type: DummyFeature, hasMany: true }
	static categories = {
		help: 'Product categories',
		default: [],
		type: DummyCategory,
		hasMany: true,
	}
}

describe('Domain Model to Payload Collection Transformation', () => {
	it('transforms domain model into Payload JS CollectionConfig with relationships and sidebar fields', () => {
		const transformer = new TransformModel()
		const staticFields = {}
		for (const [k, v] of Object.entries(DummyProduct)) {
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
		assert.deepStrictEqual(imageField.admin, { position: 'sidebar' })

		assert.deepStrictEqual(typeField.admin, { position: 'sidebar' })
		assert.deepStrictEqual(orderField.admin, { position: 'sidebar' })
		assert.strictEqual(hiddenField.admin.position, 'sidebar')

		assert.ok(featuresField)
		assert.strictEqual(featuresField.type, 'relationship')
		assert.strictEqual(featuresField.relationTo, 'features')
		assert.strictEqual(featuresField.hasMany, true)

		assert.ok(categoriesField)
		assert.strictEqual(categoriesField.type, 'relationship')
		assert.strictEqual(categoriesField.relationTo, 'categories')
		assert.strictEqual(categoriesField.hasMany, true)
	})

	it('transforms category model into Payload JS CollectionConfig fields', () => {
		const transformer = new TransformModel()
		const staticFields = {}
		for (const [k, v] of Object.entries(DummyCategory)) {
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
