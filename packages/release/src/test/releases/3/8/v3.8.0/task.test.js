import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { runGenerator } from '@nan0web/ui'
import { TodoCommand, TaskModel, MarkdownRoundTripAuditor } from '../../../../src/domain/TodoCommand.js'
import { ReleaseApp } from '../../../../src/domain/App.js'

describe('Release v3.8.0 Contract: Task AST Engine & TodoCommand', () => {
	it('ReleaseApp registers TodoCommand in its command options', () => {
		assert.ok(ReleaseApp.command.options.includes(TodoCommand))
	})

	it('TaskModel instantiates and holds task metadata', () => {
		const task = new TaskModel({
			title: 'Task Alpha',
			status: 'todo',
			badges: { pri: '1' },
			filePath: 'releases/3/8/v3.8.0/task.md',
			lineIndex: 10,
		})
		assert.equal(task.title, 'Task Alpha')
		assert.equal(task.status, 'todo')
		assert.equal(task.badges.pri, '1')
	})

	it('MarkdownRoundTripAuditor detects zero drift on valid markdown', () => {
		const md = '# Title\n\n- [ ] Task 1\n- [x] Task 2\n'
		const res = MarkdownRoundTripAuditor.audit(md)
		assert.equal(res.matches, true)
	})

	it('TodoCommand renders output and mutates task status in DB', async () => {
		const db = new DB({
			predefined: [
				['releases/task.md', '# Tasks\n\n- [ ] Item 1 [pri:high]\n- [x] Item 2\n']
			]
		})
		await db.connect()

		const cmd = new TodoCommand({ file: 'releases/task.md', done: 'Item 1' }, { db })
		const res = await runGenerator(cmd.run(), {
			ask: async () => ({ value: {} }),
			show: () => {},
			progress: () => {},
		})
		assert.equal(res.status, 'ok')
		const updated = await db.loadDocument('releases/task.md')
		assert.ok(updated.includes('- [x] Item 1'))
	})
})
