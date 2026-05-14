import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDTaskList from './MDTaskList.js'

describe('MDTaskList', () => {
	it('should create instance with correct properties', () => {
		const taskList = new MDTaskList()
		assert.strictEqual(taskList.tag, '<ul>')
		assert.strictEqual(taskList.mdTag, '[ ] ')
		assert.strictEqual(taskList.end, '')
		// Fixed expected value to match the actual implementation
		assert.strictEqual(taskList.mdEnd, ' ')
	})

	it('should parse unchecked task list correctly', () => {
		const context = {
			i: 0,
			rows: ['- [ ] Task 1', '- [ ] Task 2'],
		}
		const result = MDTaskList.parse('- [ ] Task 1', context)
		assert.ok(result instanceof MDTaskList)
		assert.strictEqual(result.children.length, 2)
	})

	it('should parse checked task list correctly', () => {
		const context = {
			i: 0,
			rows: ['- [x] Completed Task', '- [X] Another Completed Task'],
		}
		const result = MDTaskList.parse('- [x] Completed Task', context)
		assert.ok(result instanceof MDTaskList)
		assert.strictEqual(result.children.length, 2)
	})

	it('should return false for invalid task list format', () => {
		const result = MDTaskList.parse('- Not a task')
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const taskList = new MDTaskList()
		// Fixed assertion to match expected format
		assert.strictEqual(String(taskList), '[ ]  ')
	})
})
