import { test } from 'node:test'
import assert from 'node:assert'
import MDListItem from './MDListItem.js'

test('MDListItem should create instance', () => {
	const item = new MDListItem({ content: 'item', tag: '<li>', end: '</li>' })
	assert.strictEqual(item.content, 'item')
	assert.strictEqual(item.tag, '<li>')
	assert.strictEqual(item.end, '</li>')
})
