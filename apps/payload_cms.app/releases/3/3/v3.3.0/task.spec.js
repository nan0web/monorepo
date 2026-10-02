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

	it('TransformModel generates GlobalConfig for static $single = true', async () => {
		const mockGlobalCode = `
import { Model } from '@nan0web/types'

export class AppMenu extends Model {
	static $single = true
	static title = { help: 'Menu Title', default: '' }
}
`
		const db = new DB({
			predefined: [
				['src/domain/AppMenu.js', mockGlobalCode],
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

		const generated = await db.get('/src/globals/AppMenu.js') || await db.get('src/globals/AppMenu.js') || await db.get('/src/collections/AppMenu.js')
		assert.ok(generated, 'AppMenu.js should be generated')
		assert.ok(generated.includes('@type {import(\'payload\').GlobalConfig}'), 'Should contain JSDoc @type GlobalConfig')
		assert.ok(generated.includes("slug: 'appmenu'"), 'Slug should match clean name')
	})

	it('TransformModel generates Block for static $isBlock = true', async () => {
		const mockBlockCode = `
import { Model } from '@nan0web/types'

export class HeroSection extends Model {
	static $isBlock = true
	static heading = { help: 'Heading', default: '' }
}
`
		const db = new DB({
			predefined: [
				['src/domain/HeroSection.js', mockBlockCode],
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

		const generated = await db.get('/src/blocks/HeroSection.js') || await db.get('src/blocks/HeroSection.js') || await db.get('/src/collections/HeroSection.js')
		assert.ok(generated, 'HeroSection.js should be generated')
		assert.ok(generated.includes('@type {import(\'payload\').Block}'), 'Should contain JSDoc @type Block')
	})

	it('TransformModel generates Upload Collection for static $upload = true', async () => {
		const mockUploadCode = `
import { Model } from '@nan0web/types'

export class Attachment extends Model {
	static $upload = true
	static title = { help: 'Title', default: '' }
}
`
		const db = new DB({
			predefined: [
				['src/domain/Attachment.js', mockUploadCode],
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

		const generated = await db.get('/src/collections/Attachment.js') || await db.get('src/collections/Attachment.js')
		assert.ok(generated, 'Attachment.js should be generated')
		assert.ok(generated.includes('upload: true'), 'Should contain upload: true')
	})
})
