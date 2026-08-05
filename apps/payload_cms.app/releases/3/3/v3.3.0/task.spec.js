import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { TransformModel } from '../../../../src/domain/models/TransformModel.js'

describe('Release v3.3.0: @nan0web/payload-cms.app Generator Contract', () => {
	it('TransformModel handles clean class names like CardBlock and outputs .js with JSDoc @type', async () => {
		const mockModelCode = `
import { Model } from '@nan0web/types'

export class CardBlock extends Model {
	static title = { help: 'Title', default: '' }
}
`
		const db = new DB({
			predefined: [
				['src/domain/CardBlock.js', mockModelCode],
			],
		})
		await db.connect()

		const transform = new TransformModel({
			target: 'src/domain',
			output: 'src/collections',
			force: true,
		}, { db })

		for await (const intent of transform.run()) {
			// consume generator
		}

		const generated = await db.get('/src/collections/CardBlock.js') || await db.get('src/collections/CardBlock.js')
		assert.ok(generated, 'CardBlock.js should be generated without Model suffix')
		assert.ok(generated.includes('@type {import(\'payload\').CollectionConfig}'), 'Should contain JSDoc @type CollectionConfig')
		assert.ok(generated.includes("slug: 'cardblock'"), 'Slug should match clean name')
	})
})
