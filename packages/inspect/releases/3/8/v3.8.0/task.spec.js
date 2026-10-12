import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { JsDomainAuditor } from '../../../../src/domain/app/js/JsDomainAuditor.js'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'

/**
 * @param {AsyncGenerator<any, any, any>} gen
 * @returns {Promise<{ intents: any[], result: any }>}
 */
async function drainGenerator(gen) {
	const intents = []
	let last = null
	while (true) {
		const step = await gen.next()
		if (step.done) {
			last = step.value
			break
		}
		intents.push(step.value)
	}
	return { intents, result: last }
}

describe('Release v3.8.0: Model-as-Schema Field Validator & Auditors Catalog CLI', () => {
	describe('§1 Model-as-Schema static field vs constructor contract (JsDomainAuditor)', () => {
		it('passes when all static schema fields have corresponding this.field with @type in constructor', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/UserModel.js',
						`import { Model } from '@nan0web/types'

export class UserModel extends Model {
	static name = { help: 'User name', default: '' }
	static age = { help: 'User age', default: 0 }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} User name */ this.name
		/** @type {number} User age */ this.age
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, true)
			assert.equal(result.data.errors.length, 0)
		})

		it('detects missing constructor declaration for static schema fields', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/ProductModel.js',
						`import { Model } from '@nan0web/types'

export class ProductModel extends Model {
	static title = { help: 'Product title' }
	static price = { help: 'Product price' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.title
		// price is missing!
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, false)
			const error = result.data.errors.find((e) => e.check === 'missing_constructor_field')
			assert.ok(error, 'Should report missing_constructor_field')
			assert.ok(error.field === 'price' || error.error?.includes('price'))
		})

		it('detects constructor declaration without @type JSDoc annotation', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/NoTypeModel.js',
						`import { Model } from '@nan0web/types'

export class NoTypeModel extends Model {
	static count = { help: 'Item count' }

	constructor(data = {}, options = {}) {
		super(data, options)
		this.count = 0 // Missing /** @type {number} */ JSDoc annotation!
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, false)
			const error = result.data.errors.find((e) => e.check === 'missing_constructor_field')
			assert.ok(error, 'Should report missing_constructor_field due to missing @type')
			assert.equal(error.field, 'count')
		})

		it('detects Model class completely missing constructor', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/EmptyModel.js',
						`import { Model } from '@nan0web/types'

export class EmptyModel extends Model {
	static description = { help: 'Model description' }
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, false)
			const error = result.data.errors.find((e) => e.check === 'missing_constructor')
			assert.ok(error, 'Should report missing_constructor')
			assert.equal(error.field, 'description')
		})

		it('skips static metadata starting with $ ($alias, $collection, etc.)', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/ArticleModel.js',
						`import { Model } from '@nan0web/types'

export class ArticleModel extends Model {
	static $alias = 'article'
	static $collection = 'articles'
	static $title = 'Articles Registry'
	static slug = { help: 'Article slug' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.slug
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, true)
			assert.equal(result.data.errors.length, 0)
		})

		it('skips static properties starting with uppercase / PascalCase (UI, SCHEMA, SubModel, alias)', async () => {
			const db = new DB({
				predefined: [
					[
						'src/domain/OrderModel.js',
						`import { Model } from '@nan0web/types'

export class OrderModel extends Model {
	static alias = 'order'
	static UI = {
		title: 'Order',
		messages: { created: 'Order created' }
	}
	static SCHEMA = { version: 1 }
	static ItemModel = class {}
	static id = { help: 'Order ID' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.id
	}
}
`,
					],
				],
			})
			await db.connect()

			const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())

			assert.equal(result.data.success, true)
			assert.equal(result.data.errors.length, 0)
		})
	})

	describe('§2 Auditors Catalog & List CLI (InspectorApp)', () => {
		it('supports list / ls subcommand to output registered auditors catalog', async () => {
			const db = new DB({ predefined: [] })
			await db.connect()

			const app = new InspectorApp({ command: 'list' }, { db, t: (k) => k })
			const { intents, result } = await drainGenerator(app.run())

			assert.equal(result.data.ok, true)
			assert.ok(result.data.auditors && Array.isArray(result.data.auditors))
			assert.ok(result.data.auditors.some((a) => a.alias === 'domain'))
			assert.ok(result.data.auditors.some((a) => a.alias === 'hygiene'))
			assert.ok(result.data.auditors.some((a) => a.alias === 'audit'))
		})
	})
})
