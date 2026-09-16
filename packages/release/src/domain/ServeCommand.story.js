import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import ServeCommand from './ServeCommand.js'

describe('ServeCommand OLMUI Scenario & Model Test', () => {
	it('generates HTML from releases/README.md when directory exists', async () => {
		const readmeMd = `# Releases

This is the main catalog of releases.

## Active Projects
- @nan0web/ui
- @nan0web/db
`
		const templateHtml = `<!DOCTYPE html><html><body><main>{{CONTENT}}</main></body></html>`

		const db = new DB({
			predefined: [
				['releases/README.md', readmeMd],
				['packages/release/src/domain/templates/release.html', templateHtml],
			],
		})
		await db.connect()

		const cmd = new ServeCommand({ dir: 'releases', port: 3131 }, { db })
		const gen = cmd.run()

		let step = await gen.next()
		const outputs = []
		while (!step.done) {
			outputs.push(step.value)
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.ok(res.success !== false, 'Execution should succeed')
		assert.equal(res.dir, 'releases')
		assert.equal(res.port, 3131)
		assert.ok(typeof res.html === 'string', 'Should return html string')
		assert.ok(res.html.includes('Releases'), 'HTML should contain rendered markdown title')
		assert.ok(res.html.includes('main'), 'HTML should use the template')
	})

	it('yields error when target directory does not exist', async () => {
		const db = new DB({
			predefined: [],
		})
		await db.connect()

		const cmd = new ServeCommand({ dir: 'nonexistent-dir' }, { db })
		const gen = cmd.run()

		let step = await gen.next()
		const outputs = []
		while (!step.done) {
			outputs.push(step.value)
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.success, false)
		assert.ok(outputs.some((o) => o?.type === 'show' || o?.tag === 'show' || String(o).includes('Directory') || o?.content?.includes('nonexistent-dir')))
	})

	it('handles missing README.md with fallback content', async () => {
		const templateHtml = `<!DOCTYPE html><html><body>{{CONTENT}}</body></html>`
		const db = new DB({
			predefined: [
				['releases/.gitkeep', ''],
				['packages/release/src/domain/templates/release.html', templateHtml],
			],
		})
		await db.connect()

		const cmd = new ServeCommand({ dir: 'releases' }, { db })
		const gen = cmd.run()

		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.ok(res.success !== false)
		assert.ok(res.html.includes('Releases'))
	})
})
