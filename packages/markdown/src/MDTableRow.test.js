import { test } from 'node:test'
import assert from 'node:assert'
import MDTableRow from './MDTableRow.js'

test('MDTableRow should create instance', () => {
	const row = new MDTableRow({ tag: '<tr>', content: '', end: '</tr>' })
	assert.strictEqual(row.tag, '<tr>')
	assert.strictEqual(row.content, '')
	assert.strictEqual(row.end, '</tr>')
})
