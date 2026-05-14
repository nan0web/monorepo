import { describe, it } from 'node:test'
import assert from 'node:assert'
import SyncDocsApp from '../src/domain/app/SyncDocsApp.js'
import DB from '@nan0web/db'

describe('SyncDocsScenario', () => {
	it('should cascade heritage variables with 3-level nesting using "/" unpacking', async () => {
		const db = new DB()
		const memory = new DB()
		
		await memory.set('docs/index.json', {
			version: 'v5.0.0',
			server: {
				host: 'localhost',
				config: {
					port: 8080,
					secure: true,
				},
			},
		})

		await memory.set('docs/test.md', {
			content: `
# System Status
Version: <v name="version">OLD</v>
Endpoint: <v name="server/host">OLD</v>
Port: <v name="server/config/port">0</v>
			`,
		})

		db.mount('@app', memory)

		const app = new SyncDocsApp()
		app._ = { db, t: (key) => key }
		
		const runner = app.run()
		for await (const step of runner) {}

		const updatedDoc = await db.fetch('@app/docs/test.md')
		assert.ok(updatedDoc, 'Updated document should exist in DB')
		const content = updatedDoc.content

		assert.ok(content.includes('<v name="version">v5.0.0</v>'), 'Version should be updated')
		assert.ok(content.includes('<v name="server/host">localhost</v>'), 'Server host should be updated')
		assert.ok(content.includes('<v name="server/config/port">8080</v>'), 'Nested port should be updated')
	})

	it('should cascade heritage variables with 3-level nesting using "/" unpacking and multiple documents', async () => {
		const db = new DB()
		const memory = new DB({
			predefined: [
				[
					'index.json',
					{
						version: 'v1.0.0',
						server: { host: 'localhost', config: { port: 8080, secure: true } },
					},
				],
				[
					'test.md',
					{
						content: '# System Status\nVersion: <v name="version">OLD</v>\nEndpoint: <v name="server/host">OLD</v>\nPort: <v name="server/config/port">0</v>\n'
					}
				]
			]
		})

		await memory.connect()
		db.mount('@docs', memory)

		// Run SyncDocsApp with explicit path
		await SyncDocsApp.execute({ path: '@docs' }, { db, t: (key) => key })

		const updatedDoc = await db.fetch('@docs/test.md')
		assert.ok(updatedDoc, 'Updated document should exist in DB')
		const content = updatedDoc.content

		assert.ok(content.includes('<v name="version">v1.0.0</v>'), 'Version should be updated')
		assert.ok(content.includes('<v name="server/host">localhost</v>'), 'Server host should be updated')
		assert.ok(content.includes('<v name="server/config/port">8080</v>'), 'Nested port should be updated')
	})

	it('should support custom Web Component tags (nan0-var) for documentation', async () => {
		const db = new DB()
		const memory = new DB({
			predefined: [
				[
					'index.json',
					{ version: 'v3.0.0' },
				],
				[
					'doc.md',
					{ content: 'Version: <nan0-var name="version">OLD</nan0-var>' }
				]
			]
		})

		await memory.connect()
		db.mount('@app', memory)

		// Run SyncDocsApp with custom tag
		await SyncDocsApp.execute({ path: '@app', tag: 'nan0-var' }, { db, t: (key) => key })

		const updatedDoc = await db.fetch('@app/doc.md')
		const content = updatedDoc.content

		assert.ok(content.includes('<nan0-var name="version">v3.0.0</nan0-var>'), 'Custom Web Component tag should be updated')
	})
})
