import { test } from 'node:test'
import assert from 'node:assert'
import MDTableCell from './MDTableCell.js'

test('MDTableCell should create instance', () => {
	const cell = new MDTableCell({ tag: '<td>', content: 'cell', end: '</td>' })
	assert.strictEqual(cell.tag, '<td>')
	assert.strictEqual(cell.content, 'cell')
	assert.strictEqual(cell.end, '</td>')
})
