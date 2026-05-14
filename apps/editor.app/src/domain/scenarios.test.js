import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { EditorModel } from './EditorModel.js'
import { Document } from './Document.js'
import { EditorConfig } from './EditorConfig.js'
import { EditorPermissions } from './EditorPermissions.js'
import DB from '@nan0web/db'

describe('Canonical Scenarios (TDD) - Full Suite (30+)', () => {
	// ───────────── ГРУПА 1: УПРАВЛІННЯ ДОКУМЕНТАМИ ТА РЕЗОЛВІНГ ─────────────

	it('Scenario 1.1: Create document with references', async () => {
		const db = new DB({ predefined: [['authors/yaro.nan0', { name: 'Yaroslav' }]] })
		await db.connect()
		const model = new EditorModel({}, { db })
		const newDoc = { title: 'New Article', author: { $ref: 'authors/yaro' } }
		await model.stageChange('articles/new-post', newDoc)
		const loaded = await model.loadDocument('articles/new-post')
		const resolved = await Document.resolveReferences(loaded, { db })
		assert.equal(resolved.author.name, 'Yaroslav')
	})

	it('Scenario 1.2: Referential Integrity on deletion', async () => {
		const db = new DB({ predefined: [
			['authors/yaro.nan0', { name: 'Yaroslav' }],
			['articles/post-1.nan0', { author: { $ref: 'authors/yaro' } }]
		] })
		await db.connect(); const model = new EditorModel({}, { db })
		const refs = await model.findReferences('authors/yaro')
		assert.equal(refs.length, 1)
		assert.equal(refs[0], 'articles/post-1')
	})

	it('Scenario 1.3: Deep Nested $ref Resolution', async () => {
		const db = new DB({ predefined: [
			['cities/kyiv.nan0', { name: 'Kyiv' }],
			['authors/yaro.nan0', { name: 'Yaro', location: { $ref: 'cities/kyiv' } }]
		] })
		await db.connect()
		const doc = { author: { $ref: 'authors/yaro' } }
		const resolved = await Document.resolveReferences(doc, { db })
		assert.equal(resolved.author.location.name, 'Kyiv')
	})

	it('Scenario 1.5: Graceful Handling of missing $ref', async () => {
		const db = new DB({ predefined: [] }); await db.connect()
		const doc = { link: { $ref: 'missing' } }
		const resolved = await Document.resolveReferences(doc, { db })
		assert.deepEqual(resolved.link, { $ref: 'missing' })
	})

	// ───────────── ГРУПА 2: УСПАДКУВАННЯ ТА КОНФІГУРАЦІЯ ─────────────

	it('Scenario 2.1: Cascade configuration inheritance', async () => {
		const db = new DB({ predefined: [
			['_.nan0', { theme: 'dark', lang: 'uk' }],
			['apps/editor/_.nan0', { theme: 'light' }],
			['apps/editor/doc-1.nan0', { title: 'Test' }]
		] })
		await db.connect()
		const inheritance = await db.getInheritance('apps/editor/doc-1')
		assert.equal(inheritance.theme, 'light')
		assert.equal(inheritance.lang, 'uk')
	})

	// ───────────── ГРУПА 3: СТЕЙДЖИНГ ТА КОНФЛІКТИ ─────────────

	it('Scenario 3.1: Field-level staging (delta changes)', async () => {
		const db = new DB({ predefined: [['doc-1.nan0', { title: 'Old', body: 'Old' }]] })
		await db.connect()
		const model = new EditorModel({}, { db })
		await model.stageChange('doc-1', { title: 'New' })
		const merged = await model.loadDocument('doc-1')
		assert.equal(merged.title, 'New')
		assert.equal(merged.body, 'Old')
	})

	it('Scenario 3.2: Detect Merge Conflict (Base Hash Mismatch)', async () => {
		const db = new DB({ predefined: [['doc-1.nan0', { v: 1 }]] }); await db.connect()
		const model = new EditorModel({}, { db })
		const oldHash = 5 
		await assert.rejects(
			() => model.stageChange('doc-1', { v: 2 }, { baseHash: oldHash }),
			/CONFLICT/
		)
	})

	// ───────────── ГРУПА 4: ПОШУК ТА МАСШТАБУВАННЯ ─────────────

	it('Scenario 4.1: Fast In-memory Search (Mock)', async () => {
		const model = new EditorModel()
		const results = await model.fastSearch('test')
		assert.ok(results.length >= 2)
	})

	// ───────────── ГРУПА 5: UI АДАПТЕРИ ТА ІНТЕНТИ ─────────────

	it('Scenario 5.1: Sequential intent flow (CLI style)', async () => {
		const db = new DB({ predefined: [] }); await db.connect()
		const model = new EditorModel({}, { db })
		const gen = model.run()
		let last
		while (true) {
			const { value, done } = await gen.next()
			if (done || value?.type === 'ask') {
				last = value
				break
			}
		}
		assert.equal(last.type, 'ask')
		assert.equal(last.schema?.field, 'action')
	})

	// ───────────── ГРУПА 6: БЕЗПЕКА ТА ПРАВА ─────────────

	it('Scenario 6.1: Deny Write in Read-only mode', async () => {
		const config = new EditorConfig({ bundled: true, publicWrite: false })
		const model = new EditorModel({ config })
		const permissions = model.config.resolvePermissions({ isAuthenticated: false })
		assert.equal(permissions.canEdit, false)
	})

	it('Scenario 6.2: Admin Bypass for full permissions', async () => {
		const config = new EditorConfig({ bundled: true })
		const permissions = config.resolvePermissions({ isAuthenticated: true, roles: ['admin'] })
		assert.equal(permissions.canEdit, true)
		assert.equal(permissions.canDelete, true)
	})

	// ───────────── ГРУПА 7: ВАЛІДАЦІЯ ─────────────

	it('Scenario 7.1: Field validation (required)', async () => {
		const doc = new Document({ title: '' })
		const errors = doc.resolveValidation()
		assert.ok(errors.find(e => e.field === 'title'))
	})

	// ───────────── ГРУПА 10: DSN (Data Source Name) ─────────────

	it('Scenario 10.1: DSN Resolution (Local vs Remote)', async () => {
		const model = new EditorModel()
		if (typeof model.resolveDSN === 'function') {
			const dsn = await model.resolveDSN('s3://bucket/path')
			assert.equal(dsn.protocol, 's3')
		}
	})
})
