import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDTaskList from './MDTaskList.js'
import MDListItem from './MDListItem.js'

describe('MDTaskList', () => {
	it('should create instance with correct properties', () => {
		const taskList = new MDTaskList()
		assert.strictEqual(taskList.tag, '<ul>')
		assert.strictEqual(taskList.mdTag, '')
		assert.strictEqual(taskList.end, '')
		assert.strictEqual(taskList.mdEnd, '\n')
	})

	it('should parse unchecked task list correctly', () => {
		const context = {
			i: 0,
			rows: ['- [ ] Task 1', '- [ ] Task 2'],
		}
		const result = MDTaskList.parse('- [ ] Task 1', context)
		assert.ok(result instanceof MDTaskList)
		assert.strictEqual(result.children.length, 2)
		assert.strictEqual(result.children[0].status, 'todo')
		assert.strictEqual(result.children[0].content, 'Task 1')
	})

	it('should parse checked and multi-marker task list correctly', () => {
		const context = {
			i: 0,
			rows: ['- [x] Completed Task', '- [X] Another Completed', '- [>] In Progress', '- [-] Cancelled'],
		}
		const result = MDTaskList.parse('- [x] Completed Task', context)
		assert.ok(result instanceof MDTaskList)
		assert.strictEqual(result.children.length, 4)
		assert.strictEqual(result.children[0].status, 'done')
		assert.strictEqual(result.children[2].status, 'work')
		assert.strictEqual(result.children[3].status, 'fail')
	})

	it('should parse badges correctly in task item', () => {
		const item = MDListItem.parse('- [ ] Feature [pri:high] [epic:release]')
		assert.ok(item)
		assert.strictEqual(item.status, 'todo')
		assert.strictEqual(item.badges.pri, 'high')
		assert.strictEqual(item.badges.epic, 'release')
	})

	it('should return false for invalid task list format', () => {
		const result = MDTaskList.parse('- Not a task')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const taskList = new MDTaskList({
			children: [
				new MDListItem({ content: 'Task 1', status: 'todo' }),
				new MDListItem({ content: 'Task 2', status: 'done' }),
			]
		})
		assert.strictEqual(String(taskList), '- [ ] Task 1\n- [x] Task 2\n')
	})
})

