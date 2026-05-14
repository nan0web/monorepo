import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDTable from './MDTable.js'
import MDTableRow from './MDTableRow.js'

describe('MDTable', () => {
	it('should create instance with correct properties', () => {
		const table = new MDTable()
		assert.strictEqual(table.tag, '<table>')
		assert.strictEqual(table.mdTag, '|')
		assert.strictEqual(table.mdEnd, '|\n')
		assert.strictEqual(table.end, '</table>')
	})

	it('should parse valid markdown table', () => {
		const input = [
			'| Header 1 | Header 2 |',
			'|----------|----------|',
			'| Cell 1   | Cell 2   |',
			'| Cell 3   | Cell 4   |',
		].join('\n')
		const result = MDTable.parse(input)
		assert.ok(result instanceof MDTable)
		assert.strictEqual(result.children.length, 4)
		assert.ok(result.children[0] instanceof MDTableRow)
	})

	it('should return false for invalid table (missing separator)', () => {
		const input = ['| Header 1 | Header 2 |', '| Cell 1   | Cell 2   |'].join('\n')
		const result = MDTable.parse(input)
		assert.strictEqual(result, false)
	})

	it('should return false for invalid table (incorrect separator)', () => {
		const input = ['| Header 1 | Header 2 |', '|----------|', '| Cell 1   | Cell 2   |'].join('\n')
		const result = MDTable.parse(input)
		assert.strictEqual(result, false)
	})

	it('should convert to markdown string properly', () => {
		const input =
			['| Header 1 | Header 2 |', '|----------|----------|', '| Cell 1   | Cell 2   |'].join('\n') +
			'\n'
		const table = new MDTable({ content: input, mdTag: '', mdEnd: '' })
		assert.strictEqual(String(table), input)
	})

	it('should convert to HTML string properly', () => {
		const input = [
			'| Header 1 | Header 2 |',
			'|----------|----------|',
			'| Cell 1   | Cell 2   |',
		].join('\n')
		const table = new MDTable({ content: input, mdTag: '', mdEnd: '' })
		const html = table.toHTML()
		assert.ok(html.includes('<table>'))
		assert.ok(html.includes('</table>'))
	})
})
