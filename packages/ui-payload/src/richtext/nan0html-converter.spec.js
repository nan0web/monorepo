import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fromNan0Html } from './fromNan0Html.js'
import { toNan0Html } from './toNan0Html.js'

describe('NaN0HTML ↔ Lexical Converter Round-trip', () => {
	it('converts basic paragraphs and text formats', () => {
		const ast = { p: [{ strong: 'Bold text' }, ' and ', { em: 'italic text' }] }
		const lexical = fromNan0Html(ast)
		assert.equal(lexical.root.type, 'root')
		assert.equal(lexical.root.children.length, 1)
		assert.equal(lexical.root.children[0].type, 'paragraph')

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, ast)
	})

	it('converts headings correctly', () => {
		const ast = { h2: 'Title Heading' }
		const lexical = fromNan0Html(ast)
		assert.equal(lexical.root.children[0].type, 'heading')
		assert.equal(lexical.root.children[0].tag, 'h2')

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, ast)
	})

	it('converts lists and items', () => {
		const ast = { ul: [{ li: 'Item 1' }, { li: 'Item 2' }] }
		const lexical = fromNan0Html(ast)
		assert.equal(lexical.root.children[0].type, 'list')
		assert.equal(lexical.root.children[0].listType, 'bullet')

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, ast)
	})

	it('converts links with attributes', () => {
		const ast = { a: 'Click here', $href: 'https://example.com', $target: '_blank' }
		const lexical = fromNan0Html(ast)

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, { a: 'Click here', $href: 'https://example.com', $target: '_blank' })
	})

	it('preserves nan0-component losslessly', () => {
		const ast = { 'Card.Details': { card: '$' } }
		const lexical = fromNan0Html(ast)
		assert.equal(lexical.root.children[0].type, 'nan0-component')
		assert.equal(lexical.root.children[0].component, 'Card.Details')

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, ast)
	})

	it('preserves unknown tags as nan0-raw', () => {
		const ast = { 'custom-widget': 'Widget content', $mode: 'test' }
		const lexical = fromNan0Html(ast)
		assert.equal(lexical.root.children[0].type, 'nan0-raw')

		const backToAst = toNan0Html(lexical)
		assert.deepEqual(backToAst, { 'custom-widget': 'Widget content', $mode: 'test' })
	})

	it('does not double-wrap a, img, td, th children in nested arrays', () => {
		const linkLexical = fromNan0Html({ p: [{ a: 'Link', $href: '/about', $class: 'btn' }] })
		assert.equal(Array.isArray(linkLexical.root.children[0].children[0]), false)

		const imgLexical = fromNan0Html({ p: [{ img: true, $src: '/img.png', $alt: 'Pic' }] })
		assert.equal(Array.isArray(imgLexical.root.children[0].children[0]), false)

		const tableLexical = fromNan0Html({
			table: [{ tr: [{ th: 'H', $scope: 'col' }, { td: 'C', $colspan: '2' }] }],
		})
		const trChildren = tableLexical.root.children[0].children[0].children
		assert.equal(Array.isArray(trChildren[0]), false)
		assert.equal(Array.isArray(trChildren[1]), false)
	})
})
