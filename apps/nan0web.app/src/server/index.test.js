import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { AppRunner } from '../runner.js'
import SSRServer from './index.js'

describe('SSRServer Integration', () => {
	let runner
	let server
	let port

	before(async () => {
		runner = new AppRunner()
		// Boot runner generator
		for await (const _ of runner.run()) {
			// let it initialize
		}
		server = new SSRServer(runner)
		const info = await server.listen(0) // Random port
		port = info.port
	})

	after(async () => {
		await server.close()
		runner.stop()
	})

	it('should serve HTML with custom components and import map for /uk/demo', async () => {
		const res = await fetch(`http://localhost:${port}/uk/demo`)
		assert.equal(res.status, 200)
		const html = await res.text()

		// Verify importmap is present
		assert.ok(html.includes('type="importmap"'), 'must include import map')
		assert.ok(html.includes('esm.sh/lit'), 'must map lit to esm.sh CDN')
		
		// Verify custom component tags are present
		assert.ok(html.includes('<ui-header'), 'must contain ui-header tag')
		assert.ok(html.includes('<demo-counter'), 'must contain demo-counter tag')
		assert.ok(html.includes('<demo-userprofile'), 'must contain demo-userprofile tag')
		assert.ok(html.includes('<app-editor'), 'must contain app-editor tag')
		assert.ok(html.includes('<ui-footer'), 'must contain ui-footer tag')
	})

	it('should serve local static files correctly', async () => {
		const res = await fetch(`http://localhost:${port}/src/ui/lit/app.js`)
		assert.equal(res.status, 200)
		assert.equal(res.headers.get('content-type'), 'application/javascript; charset=utf-8')
		const code = await res.text()
		assert.ok(code.includes("import './components/DemoCounter.js'"), 'must serve the app.js code')
	})

	it('should serve workspace package files correctly', async () => {
		const res = await fetch(`http://localhost:${port}/packages/ui/src/domain/index.js`)
		assert.equal(res.status, 200)
		assert.equal(res.headers.get('content-type'), 'application/javascript; charset=utf-8')
		const code = await res.text()
		assert.ok(code.includes('export { FooterModel }'), 'must serve package domain files')
	})

	it('should return 404 for non-existent page/file', async () => {
		const res = await fetch(`http://localhost:${port}/some/invalid/path/that/does/not/exist`)
		assert.equal(res.status, 404)
	})
})
