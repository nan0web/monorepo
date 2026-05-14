import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDList from './MDList.js'
import MDListItem from './MDListItem.js'

describe('MDList', () => {
	it('should create instance with correct defaults', () => {
		const list = new MDList()
		assert.strictEqual(list.tag, '<ul>')
		assert.strictEqual(list.end, '</ul>')
		assert.strictEqual(list.ordered, false)
	})

	it('should create ordered list when specified', () => {
		const list = new MDList({ ordered: true })
		assert.strictEqual(list.tag, '<ol>')
		assert.strictEqual(list.end, '</ol>')
		assert.strictEqual(list.ordered, true)
	})

	it('should parse unordered list correctly', () => {
		const context = { i: 0, rows: ['- Item 1', '- Item 2', '- Item 3'] }
		const result = MDList.parse('- Item 1', context)
		assert.ok(result instanceof MDList)
		assert.strictEqual(result.ordered, false)
		assert.strictEqual(result.children.length, 3)
		assert.ok(result.children[0] instanceof MDListItem)
		assert.strictEqual(result.children[0].content, 'Item 1')
	})

	it('should parse ordered list correctly', () => {
		const context = { i: 0, rows: ['1. First', '2. Second', '3. Third'] }
		const result = MDList.parse('1. First', context)
		assert.ok(result instanceof MDList)
		assert.strictEqual(result.ordered, true)
		assert.strictEqual(result.children.length, 3)
		assert.ok(result.children[0] instanceof MDListItem)
		assert.strictEqual(result.children[0].content, 'First')
	})

	it('should add string items as MDListItem', () => {
		const list = new MDList()
		list.add('First item')
		list.add('Second item')
		assert.strictEqual(list.children.length, 2)
		assert.ok(list.children[0] instanceof MDListItem)
		assert.strictEqual(list.children[0].content, 'First item')
	})

	it('should add MDElement items directly', () => {
		const list = new MDList()
		const item = new MDListItem({ content: 'Custom item' })
		list.add(item)
		assert.strictEqual(list.children.length, 1)
		assert.ok(list.children[0] instanceof MDListItem)
		assert.strictEqual(list.children[0].content, 'Custom item')
	})

	it('should throw error when adding non-MDElement', () => {
		const list = new MDList()
		assert.throws(() => {
			list.add(123)
		}, TypeError)
	})
})
