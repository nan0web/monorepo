import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { TodoServeCommand } from './TodoServeCommand.js'

describe('TodoServeCommand Story', () => {
	it('handles GET /, GET /api/tasks and POST /api/status', async () => {
		const md = '| № | Задача | Домен | V | U | C | P(x) | Статус |\n|---|---|---|---|---|---|---|---|\n| 1 | Сервер | dev | 4 | 4 | 2 | 8 | ⬜ |\n'
		const db = new DB({ predefined: [['todo.md', md]] })
		await db.connect()

		const cmd = new TodoServeCommand({ file: 'todo.md', port: 4010 }, { db })
		const htmlRes = await cmd.handleRequest({ method: 'GET', url: '/' })
		assert.equal(htmlRes.status, 200)
		assert.ok(htmlRes.body.includes('Матриця задач'))

		const apiRes = await cmd.handleRequest({ method: 'GET', url: '/api/tasks' })
		assert.equal(JSON.parse(apiRes.body).today.length, 1)

		const postRes = await cmd.handleRequest({
			method: 'POST',
			url: '/api/status',
			body: JSON.stringify({ file: 'todo.md', target: 'Сервер', status: 'done' }),
		})
		assert.equal(postRes.status, 200)
		assert.equal(JSON.parse(postRes.body).state.today[0].status, 'done')
	})
})
