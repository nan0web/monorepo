/**
 * @file task.spec.js - Contract test suite for @nan0web/db-server v3.4.0 Release.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import DBServer from '../../../../src/DBServer.js'
import { DBServerApp } from '../../../../src/DBServerApp.js'
import { ExplorerModel } from '../../../../src/ExplorerModel.js'

describe('v3.4.0 Release Contract: @nan0web/db-server MVP', () => {
	describe('1. Model-as-App & Model-as-Schema Contracts', () => {
		it('DBServerApp defines CLI flags and metadata correctly', () => {
			assert.equal(DBServerApp.alias, 'nan0db')
			assert.ok(DBServerApp.UI.title)
			assert.ok(DBServerApp.UI.running)
			assert.ok(DBServerApp.UI.explorer)
			assert.ok(DBServerApp.root.positional)
			assert.equal(DBServerApp.port.default, 3456)
			assert.equal(DBServerApp.host.default, '0.0.0.0')
		})

		it('ExplorerModel exports full i18n schema including search and file size indicators', () => {
			assert.ok(ExplorerModel.brand.default)
			assert.ok(ExplorerModel.filesPanelTitle.default)
			assert.ok(ExplorerModel.searchPlaceholder.default)
			assert.ok(ExplorerModel.fileInfoSize.default)
			assert.ok(ExplorerModel.statusReady.default)

			const instance = new ExplorerModel()
			assert.equal(typeof instance.searchPlaceholder, 'string')
			assert.equal(typeof instance.fileInfoSize, 'string')
		})
	})

	describe('2. HTTP REST API Server Endpoints', () => {
		it('supports full document CRUD lifecycle with wildcards and stat metadata', async (t) => {
			const db = new DB()
			const srv = await DBServer.create({ db, port: 0 })
			t.after(() => srv.close())

			const base = `http://localhost:${srv.server.port}`

			// Health
			const healthRes = await fetch(`${base}/health`)
			assert.equal(healthRes.status, 200)
			const health = await healthRes.json()
			assert.equal(health.status, 'ok')

			// OpenAPI Help
			const helpRes = await fetch(`${base}/api/help`)
			assert.equal(helpRes.status, 200)
			const help = await helpRes.json()
			assert.equal(help.openapi, '3.0.0')
			assert.ok(help.endpoints.some((e) => e.path === '/api/documents/:uri'))

			// Save / Create via POST
			const postRes = await fetch(`${base}/api/documents`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					uri: 'cards/premium/visa-platinum.json',
					document: { id: 'visa-platinum', title: 'Visa Platinum', cashback: 5 },
				}),
			})
			assert.equal(postRes.status, 201)

			// Read via GET
			const getRes = await fetch(`${base}/api/documents/cards/premium/visa-platinum.json`)
			assert.equal(getRes.status, 200)
			const doc = await getRes.json()
			assert.equal(doc.title, 'Visa Platinum')
			assert.equal(doc.cashback, 5)

			// Stat
			const statRes = await fetch(`${base}/api/stat/cards/premium/visa-platinum.json`)
			assert.equal(statRes.status, 200)
			const stat = await statRes.json()
			assert.equal(stat.isFile, true)

			// Update via PUT
			const putRes = await fetch(`${base}/api/documents/cards/premium/visa-platinum.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: 'visa-platinum', title: 'Visa Platinum Elite', cashback: 7 }),
			})
			assert.equal(putRes.status, 200)

			// Verify update
			const updatedRes = await fetch(`${base}/api/documents/cards/premium/visa-platinum.json`)
			const updatedDoc = await updatedRes.json()
			assert.equal(updatedDoc.title, 'Visa Platinum Elite')
			assert.equal(updatedDoc.cashback, 7)

			// Directory listing
			const dirRes = await fetch(`${base}/api/directory/cards/premium`)
			assert.equal(dirRes.status, 200)
			const dirEntries = await dirRes.json()
			assert.ok(Array.isArray(dirEntries))
			assert.ok(dirEntries.some((e) => (e.name || e.path).includes('visa-platinum.json')))

			// Delete
			const delRes = await fetch(`${base}/api/documents/cards/premium/visa-platinum.json`, {
				method: 'DELETE',
			})
			assert.equal(delRes.status, 204)

			// Confirm 404 after delete
			const deletedRes = await fetch(`${base}/api/documents/cards/premium/visa-platinum.json`)
			assert.equal(deletedRes.status, 404)
		})
	})

	describe('3. Web File Explorer UI Verification', () => {
		it('renders explorer HTML with interactive controls and localized model strings', async (t) => {
			const db = new DB()
			const srv = await DBServer.create({ db, port: 0 })
			t.after(() => srv.close())

			const base = `http://localhost:${srv.server.port}`
			const res = await fetch(`${base}/explorer`)
			assert.equal(res.status, 200)
			const html = await res.text()

			assert.ok(html.includes('id="searchInput"'), 'Must have live search input')
			assert.ok(html.includes('filterFiles('), 'Must have file filter handler')
			assert.ok(html.includes('id="breadcrumbs"'), 'Must have breadcrumbs navigation')
			assert.ok(html.includes('id="editor"'), 'Must have document editor textarea')
			assert.ok(html.includes('formatBytes('), 'Must have byte formatter for file stats')
		})
	})
})
