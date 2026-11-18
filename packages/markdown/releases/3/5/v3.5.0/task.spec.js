import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import MDListItem from '../../../../src/MDListItem.js'
import MDTaskList from '../../../../src/MDTaskList.js'

describe('Release v3.5.0 Contract: Task AST Markers & Badges', () => {
	it('parses all task marker variants into status', () => {
		const items = [
			{ line: '- [ ] Todo item', expectedStatus: 'todo' },
			{ line: '- [x] Done item', expectedStatus: 'done' },
			{ line: '- [X] Capital done item', expectedStatus: 'done' },
			{ line: '- [>] In progress item', expectedStatus: 'work' },
			{ line: '- [-] Cancelled item', expectedStatus: 'fail' },
		]

		for (const { line, expectedStatus } of items) {
			const parsed = MDListItem.parse(line)
			assert.ok(parsed, `Failed to parse: ${line}`)
			assert.equal(parsed.status, expectedStatus)
		}
	})

	it('extracts badges from task content and preserves them', () => {
		const line = '- [ ] Implement feature [pri:high] [epic:core] [assignee:dev]'
		const item = MDListItem.parse(line)
		assert.ok(item)
		assert.equal(item.status, 'todo')
		assert.equal(item.content, 'Implement feature')
		assert.deepEqual(item.badges, {
			pri: 'high',
			epic: 'core',
			assignee: 'dev',
		})
	})

	it('serializes back to markdown with badges and correct marker', () => {
		const item = new MDListItem({
			content: 'Task Title',
			status: 'done',
			badges: { pri: 'high' }
		})
		assert.equal(item.toString(), '- [x] Task Title [pri:high]\n')
	})

	it('MDTaskList parses and aggregates list of tasks with mixed markers', () => {
		const rows = [
			'- [ ] Task 1 [pri:1]',
			'- [x] Task 2',
			'- [>] Task 3',
			'- [-] Task 4',
		]
		const list = MDTaskList.parse(rows[0], { i: 0, rows })
		assert.ok(list instanceof MDTaskList)
		assert.equal(list.children.length, 4)
		assert.equal(list.children[0].status, 'todo')
		assert.equal(list.children[0].badges.pri, '1')
		assert.equal(list.children[1].status, 'done')
		assert.equal(list.children[2].status, 'work')
		assert.equal(list.children[3].status, 'fail')
	})
})
