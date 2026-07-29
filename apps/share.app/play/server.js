#!/usr/bin/env node

/**
 * share.app Web Server — запускає команди через SSH-like API + HTML dashboard.
 * Використовує тільки built-in Node.js модулі, без додаткових залежностей.
 *
 * Запуск:
 *   node play/server.js
 *   відкрити http://localhost:4321
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4321

// Strip ANSI escape codes for SSE (web UI uses textContent)
function stripAnsi(str) {
	return str.replace(/\x1b\[[0-9;]*m/g, '')
}

// MIME типи
const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.json': 'application/json',
}

// ─── Статика ─────────────────────────────────────────────────

function serveStatic(req, res) {
	let filePath = req.url === '/' ? '/index.html' : req.url
	// Відносні шляхи — тільки з play/ та ../src/
	const safe = filePath.replace(/\.\.\//g, '').replace(/[<>"|]/g, '')
	const full = path.join(__dirname, safe)

	try {
		if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
			return false
		}
		const ext = path.extname(full)
		res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
		fs.createReadStream(full).pipe(res)
		return true
	} catch {
		return false
	}
}

// ─── API: запуск команди через SSE ────────────────────────────

/**
 * Запускає команду share.app і стрімить intents через SSE.
 * Тіло запиту: { command: 'generate:script', args: { topic: '...', ... } }
 */
async function handleRun(req, res) {
	let body = ''
	req.on('data', (chunk) => (body += chunk))
	req.on('end', async () => {
		let input
		try {
			input = JSON.parse(body)
		} catch {
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: 'Invalid JSON' }))
			return
		}

		const { command, args = {} } = input
		if (!command) {
			res.writeHead(400)
			res.end(JSON.stringify({ error: 'command required' }))
			return
		}

		// SSE headers
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
		})
		res.flushHeaders()

		const send = (event, data) => {
			if (data.message) data.message = stripAnsi(data.message)
			res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
		}

		try {
			// Імпортуємо ShareAppCLI та шукаємо потрібну команду
			const { ShareAppCLI } = await import('../src/index.js')

			// Знаходимо команду за alias
			const CommandClass = ShareAppCLI.command.options.find(
				(c) => c.alias === command
			)
			if (!CommandClass) {
				send('error', { message: `Unknown command: ${command}` })
				res.end()
				return
			}

			// Валідація типів: коерсія рядків у числа/булеві
			const coerced = { ...args }
			for (const key of Object.getOwnPropertyNames(CommandClass)) {
				const field = CommandClass[key]
				if (field && typeof field === 'object' && 'type' in field && key in coerced) {
					const val = coerced[key]
					if (field.type === 'number' && typeof val === 'string') {
						coerced[key] = val ? Number(val) : field.default
					}
					if (field.type === 'boolean' && typeof val === 'string') {
						coerced[key] = val === 'true' || val === '1'
					}
				}
			}

			// Створюємо DB
			const { default: DBFS } = await import('@nan0web/db-fs')
			const db = new DBFS({ root: '.' })

			// Запускаємо команду з валідованими типами
			const instance = new CommandClass(coerced, { db })

			for await (const intent of instance.run()) {
				switch (intent.type) {
					case 'progress':
						send('progress', { message: intent.message })
						break
					case 'log':
						send('log', { level: intent.level, message: intent.message })
						break
					case 'result':
						send('result', intent.data)
						res.end()
						return
				}
			}

			send('result', { success: true })
			res.end()
		} catch (err) {
			send('error', { message: err.message })
			res.end()
		}
	})
}

// ─── API: файловий браузер ──────────────────────────────────

function handleBrowse(req, res, parsed) {
	const dirPath = parsed.query.dir || '.'
	// Безпека: дозволено тільки в межах проєкту
	const resolved = path.resolve(dirPath)
	const projectRoot = path.resolve(__dirname, '..')

	if (!resolved.startsWith(projectRoot)) {
		res.writeHead(403, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({ error: 'Access denied: outside project root' }))
		return
	}

	try {
		const entries = fs.readdirSync(resolved, { withFileTypes: true })
		const files = entries
			.filter(e => !e.name.startsWith('.'))
			.map(e => ({
				name: e.name,
				isDir: e.isDirectory(),
				isFile: e.isFile(),
				path: path.join(resolved, e.name),
				relPath: path.relative(projectRoot, path.join(resolved, e.name)),
				ext: e.isFile() ? path.extname(e.name).toLowerCase() : null,
			}))
			.sort((a, b) => (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name.localeCompare(b.name))

		// Додаємо ".." якщо не в корені проєкту
		const parent = path.resolve(resolved, '..')
		const result = {
			currentDir: resolved,
			relDir: path.relative(projectRoot, resolved) || '.',
			canGoUp: resolved !== projectRoot,
			files,
		}

		res.writeHead(200, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify(result))
	} catch (err) {
		res.writeHead(500, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({ error: err.message }))
	}
}

// ─── API: список команд ──────────────────────────────────────

async function handleCommands(req, res) {
	const { ShareAppCLI } = await import('../src/index.js')
	const list = ShareAppCLI.command.options.map((c) => ({
		alias: c.alias,
		options: Object.getOwnPropertyNames(c)
			.filter((k) => k !== 'length' && k !== 'prototype' && k !== 'name' && typeof c[k] === 'object' && c[k] !== null && 'type' in c[k])
			.map((k) => ({
				name: k,
				type: c[k].type || 'string',
				required: !!c[k].required,
				help: c[k].help || '',
				default: c[k].default,
			})),
	}))
	res.writeHead(200, { 'Content-Type': 'application/json' })
	res.end(JSON.stringify(list, null, 2))
}

// ─── Сервер ──────────────────────────────────────────────────

const server = http.createServer((req, res) => {
	// CORS
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

	if (req.method === 'OPTIONS') {
		res.writeHead(204)
		res.end()
		return
	}

	const parsed = url.parse(req.url, true)

	if (req.method === 'POST' && parsed.pathname === '/api/run') {
		return handleRun(req, res)
	}

	if (req.method === 'GET' && parsed.pathname === '/api/browse') {
		return handleBrowse(req, res, parsed)
	}

	if (req.method === 'GET' && parsed.pathname === '/api/commands') {
		return handleCommands(req, res)
	}

	if (req.method === 'GET' && parsed.pathname === '/api/status') {
		res.writeHead(200, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({
			status: 'ok',
			version: '3.2.0',
			node: process.version,
			platform: process.platform,
		}))
		return
	}

	// Статика
	if (serveStatic(req, res)) return

	res.writeHead(404)
	res.end('Not found')
})

// Start only when run directly (not imported by tests)
const isMain = process.argv[1] && (
	process.argv[1] === url.fileURLToPath(import.meta.url) ||
	process.argv[1].endsWith('/server.js')
)
if (isMain) {
	server.listen(PORT, () => {
		console.log(`\n  share.app Web Dashboard`)
		console.log(`  http://localhost:${PORT}\n`)
	})
}

export { server, stripAnsi, serveStatic, handleRun, handleBrowse, handleCommands }