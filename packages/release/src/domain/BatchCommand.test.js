import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { BatchCommand } from './BatchCommand.js'

describe('BatchCommand', () => {
	it('detects overlapping targetFiles across tasks', () => {
		const conflicts = BatchCommand.detectConflicts([
			{ id: 'a', targetFiles: ['src/a.js', 'src/shared.js'] },
			{ id: 'b', targetFiles: ['src/b.js', 'src/shared.js'] },
		])
		assert.equal(conflicts.length, 1)
		assert.equal(conflicts[0].file, 'src/shared.js')
		assert.deepEqual(conflicts[0].tasks, ['a', 'b'])
	})

	it('dispatches up to 20 isolated worktree slots and writes slot files', async () => {
		const gitCalls = []
		const fakeSystem = {
			execGit: async (args) => {
				gitCalls.push(args)
				return { ok: true, stdout: '', stderr: '' }
			},
		}
		const db = new DB({ predefined: [] })
		await db.connect()

		const tasks = Array.from({ length: 12 }, (_, i) => ({
			id: `task-${i + 1}`,
			targetFiles: [`src/file-${i + 1}.js`],
		}))

		const cmd = new BatchCommand({ tasks, worktreeRoot: '.wt' }, { db, system: fakeSystem })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()
		const res = step.value?.data || step.value

		assert.equal(res.ok, true)
		assert.equal(res.dispatched.length, 12)
		assert.equal(gitCalls.length, 12)
		const slotRaw = await db.loadDocument('.nan0release/slots/task-1.json', null)
		assert.ok(slotRaw)
	})
})
