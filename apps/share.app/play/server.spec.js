import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'

const PORT = 19876
const BASE = `http://localhost:${PORT}`

describe('server.js — HTTP API', () => {
	let server

	before(async () => {
		const mod = await import('../play/server.js')
		server = mod.server
		server.listen(PORT)
		// Wait for server to be ready
		await new Promise((resolve) => {
			const tryConnect = () => {
				const req = http.get(`${BASE}/api/status`, (res) => {
					res.resume()
					resolve()
				})
				req.on('error', () => setTimeout(tryConnect, 50))
			}
			tryConnect()
		})
	})

	after(() => {
		if (server) server.close()
	})

	it('GET /api/status — returns ok', async () => {
		const r = await fetch(`${BASE}/api/status`)
		assert.equal(r.status, 200)
		const data = await r.json()
		assert.equal(data.status, 'ok')
		assert.ok(data.version)
		assert.ok(data.node)
		assert.ok(data.platform)
	})

	it('GET /api/commands — returns command list', async () => {
		const r = await fetch(`${BASE}/api/commands`)
		assert.equal(r.status, 200)
		const data = await r.json()
		assert.ok(Array.isArray(data))
		assert.ok(data.length > 0)
		const cmd = data.find(c => c.alias === 'download:whisper')
		assert.ok(cmd)
		assert.ok(Array.isArray(cmd.options))
		const urlOpt = cmd.options.find(o => o.name === 'url')
		assert.ok(urlOpt)
		assert.equal(urlOpt.type, 'string')
		assert.equal(urlOpt.required, true)
	})

	it('GET /api/browse — returns directory listing', async () => {
		const r = await fetch(`${BASE}/api/browse?dir=.`)
		assert.equal(r.status, 200)
		const data = await r.json()
		assert.ok(data.currentDir)
		assert.equal(data.relDir, '.')
		assert.ok(Array.isArray(data.files))
		const playDir = data.files.find(f => f.name === 'play' && f.isDir)
		assert.ok(playDir, 'should list play/ directory')
	})

	it('GET /api/browse — rejects paths outside project', async () => {
		const r = await fetch(`${BASE}/api/browse?dir=/etc`)
		assert.equal(r.status, 403)
		const data = await r.json()
		assert.equal(data.error, 'Access denied: outside project root')
	})

	it('GET /api/browse — can go into nested dirs', async () => {
		const r = await fetch(`${BASE}/api/browse?dir=src/domain`)
		assert.equal(r.status, 200)
		const data = await r.json()
		assert.ok(data.files.length > 0)
		const cmdFile = data.files.find(f => f.name === 'commands' && f.isDir)
		assert.ok(cmdFile, 'should list commands/ directory')
	})

	it('GET / — returns HTML dashboard', async () => {
		const r = await fetch(`${BASE}/`)
		assert.equal(r.status, 200)
		const html = await r.text()
		assert.ok(html.includes('share.app'))
		assert.ok(html.includes('sidebar'))
		assert.ok(html.includes('Запустити'))
		assert.ok(html.includes('fileModal'))
	})

	it('GET /nonexistent — returns 404', async () => {
		const r = await fetch(`${BASE}/nonexistent`)
		assert.equal(r.status, 404)
	})

	it('POST /api/run — returns 400 for invalid JSON', async () => {
		const r = await fetch(`${BASE}/api/run`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'not json',
		})
		assert.equal(r.status, 400)
	})

	it('POST /api/run — returns 400 for missing command', async () => {
		const r = await fetch(`${BASE}/api/run`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		})
		assert.equal(r.status, 400)
	})

	it('POST /api/run — SSE error for unknown command', async () => {
		const r = await fetch(`${BASE}/api/run`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ command: 'nonexistent:cmd' }),
		})
		assert.equal(r.status, 200)
		const text = await r.text()
		assert.ok(text.includes('event: error'))
		assert.ok(text.includes('Unknown command'))
	})

	it('POST /api/run — runs command and returns SSE events', async () => {
		const r = await fetch(`${BASE}/api/run`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				command: 'generate:script',
				args: { topic: 'test', style: 'storytelling', language: 'uk', duration: 10 },
			}),
		})
		assert.equal(r.status, 200)
		const text = await r.text()
		assert.ok(text.includes('event: '), 'should contain SSE events')
		const events = text.split('\n\n').filter(e => e.trim())
		assert.ok(events.length >= 2, `expected at least 2 SSE events, got ${events.length}`)
	})

	it('OPTIONS / — CORS headers', async () => {
		const r = await fetch(`${BASE}/`, { method: 'OPTIONS' })
		assert.equal(r.status, 204)
		assert.equal(r.headers.get('access-control-allow-origin'), '*')
	})

	it('SSE output strips ANSI escape codes', async () => {
		const r = await fetch(`${BASE}/api/run`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				command: 'generate:script',
				args: { topic: 'ANSI test', style: 'storytelling', language: 'en', duration: 5 },
			}),
		})
		const text = await r.text()
		const ansiPattern = /\x1b\[[0-9;]*m/
		assert.ok(!ansiPattern.test(text), 'SSE output should not contain ANSI escape codes')
	})
})

describe('server.js — unit: stripAnsi', () => {
	it('removes ANSI color codes', async () => {
		const { stripAnsi } = await import('../play/server.js')
		assert.equal(stripAnsi('\x1b[1mHello\x1b[0m'), 'Hello')
		assert.equal(stripAnsi('\x1b[94m·\x1b[0m'), '·')
		assert.equal(stripAnsi('\x1b[1;31mError\x1b[0m'), 'Error')
		assert.equal(stripAnsi('no codes'), 'no codes')
	})

	it('handles multiple codes', async () => {
		const { stripAnsi } = await import('../play/server.js')
		assert.equal(stripAnsi('\x1b[1m\x1b[32m✓\x1b[0m Finished!'), '✓ Finished!')
	})
})