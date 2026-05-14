import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Parser from '../../../../../../src/domain/Parser/Parser.js'
import NaN0 from '../../../../../../src/domain/NaN0.js'

describe('Release v1.5.0 Contract (Single-pass Scanner)', () => {

	it('Parser.prototype.decode should not use .split() to convert input into an array of lines', () => {
		const sourceCode = Parser.prototype.decode.toString()
		// If the parser still uses .split('\n') or .split(this.eol), it fails the performance benchmark
		assert.equal(
			sourceCode.includes('split('),
			false,
			'Parser must use a single-pass character scanner instead of .split() for performance.',
		)
	})

	it('Parser should preserve the exact same AST structure and indent validation as the old Array.map version', () => {
		const parser = new Parser({ tab: '  ' })
		const text = [
			'root:',
			'  child1: true',
			'  child2:',
			'    sub: 42',
			'sibling: null'
		].join('\n')
		
		const tree = parser.decode(text)
		
		// The AST output must remain 100% backward compatible (Node tree).
		assert.equal(tree.children.length, 2)
		assert.equal(tree.children[0].content, 'root:')
		assert.equal(tree.children[0].children.length, 2)
		assert.equal(tree.children[0].children[0].content, 'child1: true')
		assert.equal(tree.children[0].children[1].content, 'child2:')
		assert.equal(tree.children[1].content, 'sibling: null')
		
		// Indents are tracked correctly
		assert.equal(tree.children[0].children[1].children[0].indent, 2)
		assert.equal(tree.children[0].children[1].children[0].content, 'sub: 42')
	})
})
