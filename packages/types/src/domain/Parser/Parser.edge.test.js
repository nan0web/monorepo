import { describe, it } from 'node:test'
import assert from 'node:assert'
import Parser from './Parser.js'
import Node from './Node.js'

describe('Parser – edge coverage', () => {
	it('encode with children respects custom tab and eol (covers lines 85‑91)', () => {
		const parser = new Parser({ tab: '--', eol: '\r\n' })
		const root = new Node({ content: 'root', indent: 0 })
		const child = new Node({ content: 'child', indent: 1 })
		root.add(child)

		const encoded = parser.encode(root, { indent: 0 })
		const expected = `root\r\n--child`
		assert.strictEqual(encoded, expected)
	})

	it('decode skips lines with custom skip function (covers skip handling)', () => {
		const parser = new Parser({
			tab: '  ',
			skip: [(row) => row.trim().startsWith('//')],
		})
		const text = [
			'// comment line',
			'root',
			'  // inner comment',
			'  child',
			'',
			'  // trailing comment',
		].join('\n')
		const tree = parser.decode(text)
		assert.strictEqual(tree.children.length, 1)
		const root = tree.children[0]
		assert.strictEqual(root.content, 'root')
		assert.strictEqual(root.children.length, 1)
		assert.strictEqual(root.children[0].content, 'child')
	})

	it('readIndent works with custom tab length', () => {
		const parser = new Parser({ tab: '    ' }) // 4 spaces
		const indent = parser.readIndent('        text') // 8 spaces
		assert.strictEqual(indent, 2)
	})
})
