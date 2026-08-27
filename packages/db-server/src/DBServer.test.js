/**
 * @file DBServer.test.js – unit tests for the REST API server.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert'
import DB from '@nan0web/db'
import DBServer from './DBServer.js'

describe('DBServer', () => {
	it('throws if db is missing', async () => {
		assert.throws(() => new DBServer(), TypeError)
	})

	it('responds to /health', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()

		const res = await fetch(`http://localhost:${srv.server.port}/health`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.strictEqual(json.status, 'ok')
		assert.strictEqual(json.service, 'db-server')
	})

	it('responds to /api/help with OpenAPI docs', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()

		const res = await fetch(`http://localhost:${srv.server.port}/api/help`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.strictEqual(json.openapi, '3.0.0')
		assert.ok(Array.isArray(json.endpoints))
	})

	it('GET /api/documents/:uri returns document', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/test/doc.json', { name: 'hello' })

		const res = await fetch(`http://localhost:${srv.server.port}/api/documents/test/doc.json`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.strictEqual(json.name, 'hello')
	})

	it('GET /api/documents/:uri selects raw get or resolved fetch mode', async (t) => {
		const db = new DB()
		db.get = async () => ({ source: 'get' })
		db.fetch = async () => ({ source: 'fetch' })
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()

		const rawRes = await fetch(`http://localhost:${srv.server.port}/api/documents/test/doc.json?mode=get`)
		assert.deepStrictEqual(await rawRes.json(), { source: 'get' })

		const resolvedRes = await fetch(`http://localhost:${srv.server.port}/api/documents/test/doc.json?mode=fetch`)
		assert.deepStrictEqual(await resolvedRes.json(), { source: 'fetch' })
	})

	it('GET /api/documents/:uri returns 404 for missing doc', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()

		const res = await fetch(`http://localhost:${srv.server.port}/api/documents/missing.json`)
		assert.strictEqual(res.status, 404)
	})

	it('POST /api/documents creates a document', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()

		const body = JSON.stringify({ uri: '/new/doc.json', document: { title: 'created' } })
		const res = await fetch(`http://localhost:${srv.server.port}/api/documents`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
		})
		assert.strictEqual(res.status, 201)
		const json = await res.json()
		assert.strictEqual(json.ok, true)
		assert.strictEqual(json.uri, '/new/doc.json')
	})

	it('PUT /api/documents/:uri updates a document', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/update/doc.json', { version: 1 })

		const body = JSON.stringify({ version: 2 })
		const res = await fetch(`http://localhost:${srv.server.port}/api/documents/update/doc.json`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body,
		})
		assert.strictEqual(res.status, 200)

		// Verify update persisted
		const getRes = await fetch(`http://localhost:${srv.server.port}/api/documents/update/doc.json`)
		const json = await getRes.json()
		assert.strictEqual(json.version, 2)
	})

	it('DELETE /api/documents/:uri removes a document', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/delete-me.json', { x: 1 })

		const res = await fetch(`http://localhost:${srv.server.port}/api/documents/delete-me.json`, {
			method: 'DELETE',
		})
		assert.strictEqual(res.status, 204)

		// Verify deletion
		const getRes = await fetch(`http://localhost:${srv.server.port}/api/documents/delete-me.json`)
		assert.strictEqual(getRes.status, 404)
	})

	it('GET /api/stat/:uri returns document stats', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/stat/doc.json', { data: true })

		const res = await fetch(`http://localhost:${srv.server.port}/api/stat/stat/doc.json`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.strictEqual(json.isFile, true)
	})

	it('GET /api/directory/:path lists directory entries', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/dir/a.json', {})
		await db.saveDocument('/dir/b.json', {})

		const res = await fetch(`http://localhost:${srv.server.port}/api/directory/dir`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.ok(Array.isArray(json))
		const names = json.map((e) => e.name || e.path).filter(Boolean)
		assert.ok(names.includes('a.json'))
		assert.ok(names.includes('b.json'))
	})

	it('GET /api/directory/* lists nested subdirectories', async (t) => {
		const db = new DB()
		const srv = new DBServer({ db, port: 0 })
		t.after(() => srv.close())

		await srv.listen()
		await db.saveDocument('/level1/level2/deep.json', { ok: true })

		const res = await fetch(`http://localhost:${srv.server.port}/api/directory/level1/level2`)
		assert.strictEqual(res.status, 200)
		const json = await res.json()
		assert.ok(Array.isArray(json))
		const names = json.map((e) => e.name || e.path).filter(Boolean)
		assert.ok(names.some((n) => n.includes('deep.json')))
	})

	it('renders Explorer UI with model-driven i18n strings', async (t) => {
		const db = new DB()
		const model = {
			brand: 'Custom Brand DB Explorer',
			filesPanelTitle: 'Кастомні Файли',
			breadcrumbsRoot: 'корінь',
			viewModeFetch: 'db.fetch()',
			viewModeGet: 'db.get()',
			refreshButton: 'Оновити',
			saveButton: 'Зберегти',
			deleteButton: 'Видалити',
			noFileSelected: 'Оберіть файл...',
			emptyStatePrompt: 'Порожній стан',
			statusReady: 'Все готово',
		}
		const srv = new DBServer({ db, port: 0, model })
		t.after(() => srv.close())

		await srv.listen()

		const res = await fetch(`http://localhost:${srv.server.port}/explorer`)
		assert.strictEqual(res.status, 200)
		const html = await res.text()
		assert.ok(html.includes('Custom Brand DB Explorer'))
		assert.ok(html.includes('Кастомні Файли'))
		assert.ok(html.includes('Все готово'))
	})

	it('static create() starts and returns server', async (t) => {
		const db = new DB()
		const srv = await DBServer.create({ db, port: 0 })
		t.after(() => srv.close())

		const res = await fetch(`http://localhost:${srv.server.port}/health`)
		assert.strictEqual(res.status, 200)
	})
})
