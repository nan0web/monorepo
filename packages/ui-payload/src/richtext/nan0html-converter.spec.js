import { describe, it, expect } from 'vitest'
import { fromNan0Html } from './fromNan0Html.js'
import { toNan0Html } from './toNan0Html.js'

describe('NaN0HTML ↔ Lexical Converter Round-trip', () => {
	it('converts basic paragraphs and text formats', () => {
		const ast = { p: [{ strong: 'Bold text' }, ' and ', { em: 'italic text' }] }
		const lexical = fromNan0Html(ast)
		expect(lexical.root.type).toBe('root')
		expect(lexical.root.children.length).toBe(1)
		expect(lexical.root.children[0].type).toBe('paragraph')

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual(ast)
	})

	it('converts headings correctly', () => {
		const ast = { h2: 'Title Heading' }
		const lexical = fromNan0Html(ast)
		expect(lexical.root.children[0].type).toBe('heading')
		expect(lexical.root.children[0].tag).toBe('h2')

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual(ast)
	})

	it('converts lists and items', () => {
		const ast = { ul: [{ li: 'Item 1' }, { li: 'Item 2' }] }
		const lexical = fromNan0Html(ast)
		expect(lexical.root.children[0].type).toBe('list')
		expect(lexical.root.children[0].listType).toBe('bullet')

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual(ast)
	})

	it('converts links with attributes', () => {
		const ast = { a: 'Click here', $href: 'https://example.com', $target: '_blank' }
		const lexical = fromNan0Html(ast)

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual({ a: 'Click here', $href: 'https://example.com', $target: '_blank' })
	})

	it('preserves nan0-component losslessly', () => {
		const ast = { 'Card.Details': { card: '$' } }
		const lexical = fromNan0Html(ast)
		expect(lexical.root.children[0].type).toBe('nan0-component')
		expect(lexical.root.children[0].component).toBe('Card.Details')

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual(ast)
	})

	it('preserves unknown tags as nan0-raw', () => {
		const ast = { 'custom-widget': 'Widget content', $mode: 'test' }
		const lexical = fromNan0Html(ast)
		expect(lexical.root.children[0].type).toBe('nan0-raw')

		const backToAst = toNan0Html(lexical)
		expect(backToAst).toEqual({ 'custom-widget': 'Widget content', $mode: 'test' })
	})
})
