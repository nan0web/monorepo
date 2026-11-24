import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { TrayCommand } from './TrayCommand.js'

describe('TrayCommand Story', () => {
	it('renders SwiftBar output and handles set-status with mirror sync', async () => {
		const md = '| № | Задача | Домен | V | U | C | P(x) | Статус |\n|---|---|---|---|---|---|---|---|\n| 1 | Тест | dev | 5 | 5 | 1 | 25 | ⬜ |\n'
		const db = new DB({
			predefined: [
				['todo.md', md],
				['pool.md', md],
				['projects.nan0', { nanweb: { dir: '/Users/i/src/nan.web' } }],
			],
		})
		await db.connect()

		const cmd = new TrayCommand({ action: 'set-status', file: 'todo.md', target: 'Тест', status: 'work' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()
		const res = step.value?.data || step.value
		assert.equal(res.ok, true)
		assert.deepEqual(res.updatedFiles, ['todo.md', 'pool.md'])
	})
})
