import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/types'
import { CollectionBuilder, buildCollectionsFromModels } from '../../../../../index.js'
import {
	CollectionBuilder as DomainCollectionBuilder,
	buildCollectionsFromModels as domainBuildCollections,
} from '../../../../../domain/index.js'

class ItemModel {
	static schema = {
		label: { type: 'string', required: true },
		qty: { type: 'number', default: 1 },
	}
}

class SeoModel {
	static schema = {
		title: { type: 'string' },
		description: { type: 'textarea' },
	}
}

class EventModel {
	static slug = 'events'
	static schema = {
		slug: { type: 'string', required: true },
		type: { type: 'string', options: ['online', 'offline'], default: 'online' },
		status: { type: 'string', options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }] },
		currency: { type: 'string', default: 'UAH' },
		starts_at: { type: 'date', required: true },
		ends_at: { type: 'date' },
		content: { type: 'richtext', admin: { description: 'Main body' } },
		seo: { type: 'object', model: SeoModel },
		items: { type: 'array', model: ItemModel },
		active: { type: 'boolean', default: true },
	}
}

describe('v3.5.0 — CollectionBuilder', () => {
	it('exports CollectionBuilder and buildCollectionsFromModels from index and domain/index', () => {
		assert.equal(CollectionBuilder, DomainCollectionBuilder)
		assert.equal(buildCollectionsFromModels, domainBuildCollections)
	})

	it('builds CollectionConfig with row for meta and date fields', () => {
		const fakeEditor = { name: 'lexical-mock' }
		const config = CollectionBuilder.buildCollection(EventModel, { editor: fakeEditor })

		assert.equal(config.slug, 'events')
		assert.ok(Array.isArray(config.fields))

		const metaRow = config.fields[0]
		assert.equal(metaRow.type, 'row')
		assert.deepEqual(
			metaRow.fields.map((f) => f.name),
			['slug', 'type', 'status', 'currency'],
		)
		assert.equal(metaRow.fields[0].required, true)
		assert.equal(metaRow.fields[1].type, 'select')
		assert.equal(metaRow.fields[1].defaultValue, 'online')
		assert.deepEqual(metaRow.fields[1].options, [
			{ label: 'online', value: 'online' },
			{ label: 'offline', value: 'offline' },
		])

		const dateRow = config.fields[1]
		assert.equal(dateRow.type, 'row')
		assert.deepEqual(
			dateRow.fields.map((f) => f.name),
			['starts_at', 'ends_at'],
		)
		assert.equal(dateRow.fields[0].type, 'date')
		assert.equal(dateRow.fields[0].required, true)
	})

	it('supports richText with editor, group for object, and recursive array', () => {
		const fakeEditor = { name: 'lexical-mock' }
		const config = CollectionBuilder.buildCollection(EventModel, { editor: fakeEditor })

		const contentField = config.fields.find((f) => f.name === 'content')
		assert.equal(contentField.type, 'richText')
		assert.equal(contentField.editor, fakeEditor)
		assert.deepEqual(contentField.admin, { description: 'Main body' })

		const seoField = config.fields.find((f) => f.name === 'seo')
		assert.equal(seoField.type, 'group')
		assert.equal(seoField.fields.length, 2)
		assert.equal(seoField.fields[0].name, 'title')
		assert.equal(seoField.fields[1].type, 'textarea')

		const itemsField = config.fields.find((f) => f.name === 'items')
		assert.equal(itemsField.type, 'array')
		assert.equal(itemsField.fields.length, 2)
		assert.equal(itemsField.fields[0].name, 'label')
		assert.equal(itemsField.fields[0].required, true)
		assert.equal(itemsField.fields[1].name, 'qty')
		assert.equal(itemsField.fields[1].type, 'number')
		assert.equal(itemsField.fields[1].defaultValue, 1)

		const activeField = config.fields.find((f) => f.name === 'active')
		assert.equal(activeField.type, 'checkbox')
		assert.equal(activeField.defaultValue, true)
	})

	it('buildCollectionsFromModels converts array and map of models', () => {
		const fromArray = buildCollectionsFromModels([EventModel])
		assert.equal(fromArray.length, 1)
		assert.equal(fromArray[0].slug, 'events')

		const fromMap = buildCollectionsFromModels({ 'custom-events': EventModel })
		assert.equal(fromMap.length, 1)
		assert.equal(fromMap[0].slug, 'custom-events')
	})

	it('reads @nan0web/types Model static fields via getMetadata and $collection', () => {
		class CardModel extends Model {
			static $collection = 'cards'
			static title = { help: 'Card title', default: '', localized: true }
			static description = { help: 'Card desc', default: '', hint: 'textarea' }
			static hidden = { help: 'Hidden', default: false, type: 'boolean', admin: { position: 'sidebar' } }
		}

		const config = CollectionBuilder.buildCollection(CardModel)
		assert.equal(config.slug, 'cards')

		const titleField = config.fields.find((f) => f.name === 'title')
		assert.equal(titleField.type, 'text')
		assert.equal(titleField.localized, true)

		const descField = config.fields.find((f) => f.name === 'description')
		assert.equal(descField.type, 'textarea')

		const hiddenField = config.fields.find((f) => f.name === 'hidden')
		assert.equal(hiddenField.type, 'checkbox')
		assert.deepEqual(hiddenField.admin, { position: 'sidebar' })
	})
})
