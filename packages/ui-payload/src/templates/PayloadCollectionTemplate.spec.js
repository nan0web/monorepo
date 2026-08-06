import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PayloadCollectionTemplate } from './PayloadCollectionTemplate.js'

describe('PayloadCollectionTemplate', () => {
	it('compiles Payload CMS collection code using CodeTemplate', async () => {
		const tpl = new PayloadCollectionTemplate({
			collectionSlug: 'card',
			useAsTitle: 'name',
			labels: { singular: { uk: 'Картка', en: 'Card' }, plural: { uk: 'Картки', en: 'Cards' } },
			group: { uk: 'Продукти', en: 'Products' },
			fields: [
				{ name: 'id', type: 'text', required: true },
				{ name: 'name', type: 'text', localized: true },
			],
		})

		const output = await tpl.compile()

		assert.ok(output.includes("const collectionSlug = 'card'"))
		assert.ok(output.includes("const useAsTitle = 'name'"))
		assert.ok(output.includes('"uk": "Картка"'))
		assert.ok(output.includes('"name": "id"'))

	})
})
