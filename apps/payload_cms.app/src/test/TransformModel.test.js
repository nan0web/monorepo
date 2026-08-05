import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/types'
import { DB } from '@nan0web/db'
import { TransformModel } from '../domain/models/TransformModel.js'

// ─── Test Dummy Models ───────────────────────────────────────────────────────

class TestAttachment extends Model {
	static $collection = 'test_attachments'
	static UI = { $singular: 'Attachment', $plural: 'Attachments', $group: 'Media' }

	static title = { type: 'string', localized: true }
	static url = { type: 'string', required: true }
}

class TestTermBlock extends Model {
	static $isBlock = true
	static UI = { $singular: 'Term Block', $plural: 'Term Blocks' }

	static sectionId = { type: 'string', required: true, alias: 'id' }
	static text = { type: 'string', localized: true }
}

class TestProduct extends Model {
	static $collection = 'test_products'
	static UI = {
		$singular: 'Test Product',
		$plural: 'Test Products',
		$group: 'Catalog',
		$useAsTitle: ['title', 'code'],
		$defaultColumns: ['title', 'code', 'price', 'order'],
	}

	// Primitives
	static code = { type: 'string', required: true, unique: true }
	static title = { type: 'string', required: true, localized: true }
	static description = { type: 'text/markdown', localized: true }
	static hidden = { type: 'boolean', default: false }

	// Numbers
	static price = { type: 'number', step: 0.01 }
	static order = { type: 'integer' }

	// Relationships & Media
	static image = { type: 'media' }
	static mainAttachment = { type: TestAttachment }

	// Arrays
	static tags = { type: 'string[]' }
	static attachments = { type: 'array', model: TestAttachment }

	// Blocks
	static contentBlocks = { type: 'blocks', blocks: [TestTermBlock] }

	// Enum / Select
	static status = { type: 'enum', options: ['draft', 'published'] }
}

// ─── Test Setup ──────────────────────────────────────────────────────────────

describe('TransformModel — Payload CMS Schema Generator', () => {
	const db = new DB({ predefined: [] })
	const appDb = new DB({
		predefined: [
			['app/index.nan0', { title: 'Application Config' }],
			[
				'app/_/langs.nan0',
				[
					{ locale: 'en', title: 'English' },
					{ locale: 'uk', title: 'Українська' },
				],
			],
			[
				'app/uk/_/t.nan0',
				{
					Attachment: 'Додаток',
					Attachments: 'Додатки',
					'Term Block': 'Блок умов',
					'Term Blocks': 'Блоки умов',
					'Test Product': 'Тестовий продукт',
					'Test Products': 'Тестові продукти',
					Catalog: 'Каталог',
					Media: 'Медіа',
				},
			],
			[
				'app/en/_/t.nan0',
				{
					Attachment: 'Attachment',
					Attachments: 'Attachments',
					'Term Block': 'Term Block',
					'Term Blocks': 'Term Blocks',
					'Test Product': 'Test Product',
					'Test Products': 'Test Products',
					Catalog: 'Catalog',
					Media: 'Media',
				},
			],
			[
				'package.json',
				{
					exports: {
						'./domain': {
							TestAttachment,
							TestTermBlock,
							TestProduct,
						},
					},
				},
			],
		],
	})

	/** @type {TransformModel} */
	let transformer

	before(async () => {
		await appDb.connect()
		db.mount('@app', appDb)
		await db.connect()
		transformer = new TransformModel({}, { db })
	})

	// ─── 1. Primitive Type Mapping ──────────────────────────────────────────

	describe('Primitive types', () => {
		it('#1 string → text', () => {
			const f = transformer.transformField('code', { type: 'string' })
			assert.equal(f.type, 'text')
			assert.equal(f.name, 'code')
		})

		it('#2 string + hint:textarea → textarea', () => {
			const f = transformer.transformField('bio', { type: 'string', hint: 'textarea' })
			assert.equal(f.type, 'textarea')
		})

		it('#3 string + hint:code → code', () => {
			const f = transformer.transformField('snippet', { type: 'string', hint: 'code' })
			assert.equal(f.type, 'code')
		})

		it('#4 text/markdown → textarea', () => {
			const f = transformer.transformField('content', { type: 'text/markdown' })
			assert.equal(f.type, 'textarea')
		})

		it('#4b markdown (alias) → textarea', () => {
			const f = transformer.transformField('body', { type: 'markdown' })
			assert.equal(f.type, 'textarea')
		})

		it('#5 number → number with custom step', () => {
			const f = transformer.transformField('price', { type: 'number', step: 0.01 })
			assert.equal(f.type, 'number')
			assert.equal(f.admin.step, 0.01)
		})

		it('#5b number without step → number (no admin.step)', () => {
			const f = transformer.transformField('amount', { type: 'number' })
			assert.equal(f.type, 'number')
			assert.equal(f.admin, undefined)
		})

		it('#6 integer → number with step=1', () => {
			const f = transformer.transformField('order', { type: 'integer' })
			assert.equal(f.type, 'number')
			assert.equal(f.admin.step, 1)
		})

		it('#7 boolean → checkbox with BooleanCell', () => {
			const f = transformer.transformField('hidden', { type: 'boolean', default: false })
			assert.equal(f.type, 'checkbox')
			assert.equal(f.defaultValue, false)
			assert.equal(f.admin.components.Cell, '@nan0web/ui-payload#BooleanCell')
		})

		it('#8 date → date', () => {
			const f = transformer.transformField('createdAt', { type: 'date' })
			assert.equal(f.type, 'date')
		})

		it('#9 email → email', () => {
			const f = transformer.transformField('contactEmail', { type: 'email' })
			assert.equal(f.type, 'email')
		})

		it('#10a enum → select', () => {
			const f = transformer.transformField('status', { type: 'enum', options: ['draft', 'published'] })
			assert.equal(f.type, 'select')
			assert.deepEqual(f.options, ['draft', 'published'])
		})

		it('#10b enum + hint:radio → radio', () => {
			const f = transformer.transformField('priority', { type: 'enum', hint: 'radio', options: ['low', 'high'] })
			assert.equal(f.type, 'radio')
			assert.deepEqual(f.options, ['low', 'high'])
		})

		it('#11a media → upload', () => {
			const f = transformer.transformField('avatar', { type: 'media' })
			assert.equal(f.type, 'upload')
			assert.equal(f.relationTo, 'media')
		})

		it('#11b hint:upload → upload', () => {
			const f = transformer.transformField('file', { type: 'string', hint: 'upload' })
			assert.equal(f.type, 'upload')
			assert.equal(f.relationTo, 'media')
		})

		it('#12 string[] → array of text items', () => {
			const f = transformer.transformField('tags', { type: 'string[]' })
			assert.equal(f.type, 'array')
			assert.equal(f.fields.length, 1)
			assert.equal(f.fields[0].name, 'item')
			assert.equal(f.fields[0].type, 'text')
		})

		it('#16 object → json', () => {
			const f = transformer.transformField('metadata', { type: 'object' })
			assert.equal(f.type, 'json')
		})

		it('unknown type → text (fallback)', () => {
			const f = transformer.transformField('weird', { type: 'something_unknown' })
			assert.equal(f.type, 'text')
		})
	})

	// ─── 2. Structural / Relational Types ───────────────────────────────────

	describe('Structural types', () => {
		it('#13 type: ModelClass → relationship', () => {
			const f = transformer.transformField('author', { type: TestAttachment })
			assert.equal(f.type, 'relationship')
			assert.equal(f.relationTo, 'testattachment')
		})

		it('#14 array + model: ModelClass → array with nested relationship', () => {
			const f = transformer.transformField('files', { type: 'array', model: TestAttachment })
			assert.equal(f.type, 'array')
			assert.equal(f.fields.length, 1)
			assert.equal(f.fields[0].type, 'relationship')
			assert.equal(f.fields[0].relationTo, 'testattachment')
		})

		it('#15 array + fields: [...] → array with passed-through fields', () => {
			const customFields = [
				{ name: 'x', type: 'number' },
				{ name: 'y', type: 'number' },
			]
			const f = transformer.transformField('coords', { type: 'array', fields: customFields })
			assert.equal(f.type, 'array')
			assert.deepEqual(f.fields, customFields)
		})

		it('#15b array without model or fields → json fallback', () => {
			const f = transformer.transformField('raw', { type: 'array' })
			assert.equal(f.type, 'json')
		})

		it('#16 blocks + blocks:[ModelClass,...] → blocks with block names', () => {
			const f = transformer.transformField('layout', { type: 'blocks', blocks: [TestTermBlock] })
			assert.equal(f.type, 'blocks')
			assert.deepEqual(f.blocks, ['TestTermBlockBlock'])
		})

		it('#16b blocks with string references', () => {
			const f = transformer.transformField('layout', { type: 'blocks', blocks: ['CustomBlock'] })
			assert.equal(f.type, 'blocks')
			assert.deepEqual(f.blocks, ['CustomBlock'])
		})
	})

	// ─── 3. Meta-Properties ─────────────────────────────────────────────────

	describe('Meta-properties', () => {
		it('#17 localized: true', () => {
			const f = transformer.transformField('title', { type: 'string', localized: true })
			assert.equal(f.localized, true)
		})

		it('#17b localized not set → absent', () => {
			const f = transformer.transformField('slug', { type: 'string' })
			assert.equal(f.localized, undefined)
		})

		it('#18 required: true', () => {
			const f = transformer.transformField('name', { type: 'string', required: true })
			assert.equal(f.required, true)
		})

		it('#18b required not set → absent', () => {
			const f = transformer.transformField('notes', { type: 'string' })
			assert.equal(f.required, undefined)
		})

		it('#19a default: string', () => {
			const f = transformer.transformField('status', { type: 'string', default: 'draft' })
			assert.equal(f.defaultValue, 'draft')
		})

		it('#19b default: number', () => {
			const f = transformer.transformField('order', { type: 'number', default: 0 })
			assert.equal(f.defaultValue, 0)
		})

		it('#19c default: boolean', () => {
			const f = transformer.transformField('active', { type: 'boolean', default: true })
			assert.equal(f.defaultValue, true)
		})

		it('#19d default: object → ignored (not primitive)', () => {
			const f = transformer.transformField('config', { type: 'object', default: { a: 1 } })
			assert.equal(f.defaultValue, undefined)
		})

		it('#20 help → label (current mapping)', () => {
			const f = transformer.transformField('name', { type: 'string', help: 'Full name' })
			assert.equal(f.label, 'Full name')
		})

		it('#21 alias → no Payload mapping (ignored)', () => {
			const f = transformer.transformField('sectionId', { type: 'string', alias: 'id' })
			assert.equal(f.type, 'text')
			assert.equal(f.alias, undefined)
		})
	})

	// ─── 4. Special Admin Behaviors ─────────────────────────────────────────

	describe('Admin behaviors', () => {
		it('fieldName "UI" → admin.hidden: true', () => {
			const f = transformer.transformField('UI', { type: 'string' })
			assert.equal(f.admin.hidden, true)
		})

		it('fieldName "ui" → admin.hidden: true', () => {
			const f = transformer.transformField('ui', { type: 'object' })
			assert.equal(f.admin.hidden, true)
		})

		it('fieldName "image" with type text → ImageCell component', () => {
			const f = transformer.transformField('image', { type: 'string' })
			assert.equal(f.type, 'text')
			assert.equal(f.admin.components.Cell, '@nan0web/ui-payload#ImageCell')
		})

		it('fieldName "ogImage" with type text → ImageCell component', () => {
			const f = transformer.transformField('ogImage', { type: 'string' })
			assert.equal(f.type, 'text')
			assert.equal(f.admin.components.Cell, '@nan0web/ui-payload#ImageCell')
		})

		it('fieldName "image" with type media → upload (NOT ImageCell)', () => {
			const f = transformer.transformField('image', { type: 'media' })
			assert.equal(f.type, 'upload')
			// ImageCell should NOT apply when type is not 'text'
			assert.equal(f.admin?.components?.Cell, undefined)
		})
	})

	// ─── 5. Edge Cases & Null Safety ────────────────────────────────────────

	describe('Edge cases', () => {
		it('null fieldInfo → null', () => {
			const f = transformer.transformField('x', null)
			assert.equal(f, null)
		})

		it('undefined fieldInfo → null', () => {
			const f = transformer.transformField('x', undefined)
			assert.equal(f, null)
		})

		it('non-object fieldInfo → null', () => {
			const f = transformer.transformField('x', 'just a string')
			assert.equal(f, null)
		})

		it('number fieldInfo → null', () => {
			const f = transformer.transformField('x', 42)
			assert.equal(f, null)
		})

		it('empty object fieldInfo → text (default)', () => {
			const f = transformer.transformField('x', {})
			assert.equal(f.type, 'text')
		})

		it('enum with empty options → select with empty array', () => {
			const f = transformer.transformField('kind', { type: 'enum' })
			assert.equal(f.type, 'select')
			assert.deepEqual(f.options, [])
		})

		it('blocks without blocks array → blocks type, no blocks property', () => {
			const f = transformer.transformField('layout', { type: 'blocks' })
			assert.equal(f.type, 'blocks')
			assert.equal(f.blocks, undefined)
		})

		it('combined meta: required + localized + default + help', () => {
			const f = transformer.transformField('title', {
				type: 'string',
				required: true,
				localized: true,
				default: 'Untitled',
				help: 'Page title',
			})
			assert.equal(f.type, 'text')
			assert.equal(f.required, true)
			assert.equal(f.localized, true)
			assert.equal(f.defaultValue, 'Untitled')
			assert.equal(f.label, 'Page title')
		})

		it('integer with explicit step overrides auto step=1', () => {
			const f = transformer.transformField('count', { type: 'integer', step: 5 })
			assert.equal(f.type, 'number')
			assert.equal(f.admin.step, 5)
		})
	})

	// ─── 6. generateModel (Golden Master) ───────────────────────────────────

	describe('generateModel — Collection output', () => {
		const supportedLangs = [
			{ locale: 'en', title: 'English' },
			{ locale: 'uk', title: 'Українська' },
		]

		it('generates correct Collection slug', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'test_products', group: 'Catalog' },
				uiSingular: 'Test Product',
				uiPlural: 'Test Products',
				staticFields: { title: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes("slug: 'test_products'"))
			assert.ok(outputCode.includes('CollectionConfig'))
			assert.ok(outputCode.includes('export const TestProductCollection'))
		})

		it('generates i18n labels for all supported languages', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'test_products', group: null },
				uiSingular: 'Test Product',
				uiPlural: 'Test Products',
				staticFields: { title: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('"en"'))
			assert.ok(outputCode.includes('"uk"'))
			assert.ok(outputCode.includes('singular'))
			assert.ok(outputCode.includes('plural'))
		})

		it('generates admin.group when config.group is set', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: 'Catalog' },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: { title: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes("group: 'Catalog'"))
		})

		it('omits admin.group when config.group is null', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: null },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: { title: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(!outputCode.includes('group:'))
		})

		it('generates access control for Collection (read, create, update, delete)', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: null },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: { title: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('read: () => true'))
			assert.ok(outputCode.includes('create:'))
			assert.ok(outputCode.includes('update:'))
			assert.ok(outputCode.includes('delete:'))
		})

		it('generates fields JSON with all transformed fields', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: null },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: {
					title: { type: 'string', required: true },
					price: { type: 'number', step: 0.01 },
				},
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('"name": "title"'))
			assert.ok(outputCode.includes('"name": "price"'))
			assert.ok(outputCode.includes('"type": "text"'))
			assert.ok(outputCode.includes('"type": "number"'))
		})

		it('generates defaultColumns from field priorities', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: null },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: {
					image: { type: 'string' },
					title: { type: 'string' },
					slug: { type: 'string' },
					updatedAt: { type: 'date' },
				},
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('defaultColumns'))
			assert.ok(outputCode.includes('"image"'))
			assert.ok(outputCode.includes('"title"'))
			assert.ok(outputCode.includes('"slug"'))
			assert.ok(outputCode.includes('"updatedAt"'))
		})

		it('skips $-prefixed fields and UI field', () => {
			const model = {
				className: 'TestProduct',
				config: { isGlobal: false, slug: 'products', group: null },
				uiSingular: 'Product',
				uiPlural: 'Products',
				staticFields: {
					$group: 'Catalog',
					UI: { $singular: 'Product' },
					title: { type: 'string' },
				},
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('"name": "title"'))
			assert.ok(!outputCode.includes('"name": "$group"'))
		})
	})

	describe('generateModel — Global output', () => {
		const supportedLangs = [
			{ locale: 'en', title: 'English' },
			{ locale: 'uk', title: 'Українська' },
		]

		it('generates Global config with label (not labels)', () => {
			const model = {
				className: 'SiteSettings',
				config: { isGlobal: true, slug: 'site-settings', group: 'Settings' },
				uiSingular: 'Site Settings',
				uiPlural: 'Site Settings',
				staticFields: { siteName: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('GlobalConfig'))
			assert.ok(outputCode.includes('export const SiteSettings'))
			assert.ok(outputCode.includes("slug: 'site-settings'"))
			// Globals use `label`, not `labels`
			assert.ok(outputCode.includes('label:'))
			assert.ok(!outputCode.includes('labels:'))
		})

		it('generates access control for Global (read, update only)', () => {
			const model = {
				className: 'SiteSettings',
				config: { isGlobal: true, slug: 'site-settings', group: null },
				uiSingular: 'Site Settings',
				uiPlural: 'Site Settings',
				staticFields: { siteName: { type: 'string' } },
			}
			const { outputCode } = transformer.generateModel(model, supportedLangs)
			assert.ok(outputCode.includes('read: () => true'))
			assert.ok(outputCode.includes('update:'))
			// Globals should NOT have create/delete
			assert.ok(!outputCode.includes('create:'))
			assert.ok(!outputCode.includes('delete:'))
		})
	})

	// ─── 7. readDomainModels ────────────────────────────────────────────────

	describe('readDomainModels', () => {
		it('extracts models with UI from domain module', () => {
			const domainModule = { TestAttachment, TestTermBlock, TestProduct }
			const models = transformer.readDomainModels(domainModule)

			assert.ok(models.length >= 2, `Expected at least 2 models, got ${models.length}`)

			const product = models.find((m) => m.className === 'TestProduct')
			assert.ok(product, 'TestProduct should be extracted')
			assert.equal(product.config.isGlobal, false)
			assert.equal(product.config.slug, 'test_products')
			assert.equal(product.config.group, 'Catalog')
			assert.equal(product.uiSingular, 'Test Product')
			assert.equal(product.uiPlural, 'Test Products')
		})

		it('skips non-function exports', () => {
			const domainModule = {
				TestProduct,
				someString: 'hello',
				someNumber: 42,
				someObject: { foo: 'bar' },
			}
			const models = transformer.readDomainModels(domainModule)
			const names = models.map((m) => m.className)
			assert.ok(!names.includes('someString'))
			assert.ok(!names.includes('someNumber'))
			assert.ok(!names.includes('someObject'))
		})

		it('skips classes without UI property', () => {
			class NoUIModel extends Model {
				static $collection = 'no_ui'
				static title = { type: 'string' }
			}
			const domainModule = { NoUIModel, TestProduct }
			const models = transformer.readDomainModels(domainModule)
			const names = models.map((m) => m.className)
			assert.ok(!names.includes('NoUIModel'))
			assert.ok(names.includes('TestProduct'))
		})

		it('reads $single: true as isGlobal', () => {
			class GlobalSettings extends Model {
				static $single = true
				static UI = { $singular: 'Settings', $plural: 'Settings' }
				static siteName = { type: 'string' }
			}
			const domainModule = { GlobalSettings }
			const models = transformer.readDomainModels(domainModule)
			assert.equal(models[0].config.isGlobal, true)
		})

		it('reads group from UI.$group', () => {
			const domainModule = { TestAttachment }
			const models = transformer.readDomainModels(domainModule)
			const att = models.find((m) => m.className === 'TestAttachment')
			assert.equal(att.config.group, 'Media')
		})
	})
})
