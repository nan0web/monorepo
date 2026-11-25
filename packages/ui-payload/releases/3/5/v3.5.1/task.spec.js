import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fromNan0Html } from '../../../../src/richtext/fromNan0Html.js'

describe('Release v3.5.1: fromNan0Html flat children for a, img, td, th', () => {
	it('returns flat Lexical nodes without nested arrays for <a>', () => {
		const ast = { p: [{ a: 'Click', $href: 'https://example.com', $class: 'btn' }] }
		const lexical = fromNan0Html(ast)
		const pChildren = lexical.root.children[0].children

		assert.equal(pChildren.length, 1)
		assert.equal(Array.isArray(pChildren[0]), false, '<a> child must not be a nested array')
		assert.equal(pChildren[0].type, 'nan0-element')
	})

	it('returns flat Lexical nodes without nested arrays for <img>', () => {
		const ast = { p: [{ img: true, $src: '/logo.png', $alt: 'Logo' }] }
		const lexical = fromNan0Html(ast)
		const pChildren = lexical.root.children[0].children

		assert.equal(pChildren.length, 1)
		assert.equal(Array.isArray(pChildren[0]), false, '<img> child must not be a nested array')
		assert.equal(pChildren[0].type, 'nan0-element')
	})

	it('returns flat Lexical nodes without nested arrays for <td> and <th>', () => {
		const ast = {
			table: [
				{
					tr: [
						{ th: 'Header', $scope: 'col' },
						{ td: 'Cell', $colspan: '2' },
					],
				},
			],
		}
		const lexical = fromNan0Html(ast)
		const trChildren = lexical.root.children[0].children[0].children

		assert.equal(trChildren.length, 2)
		assert.equal(Array.isArray(trChildren[0]), false, '<th> child must not be a nested array')
		assert.equal(Array.isArray(trChildren[1]), false, '<td> child must not be a nested array')
		assert.equal(trChildren[0].type, 'nan0-element')
		assert.equal(trChildren[1].type, 'nan0-element')
	})
})
