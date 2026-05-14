import { test } from 'node:test'
import assert from 'node:assert'
import MDElement from './MDElement.js'

test('MDElement should create with default props', () => {
	const el = new MDElement()
	assert.strictEqual(el.content, '')
	assert.strictEqual(el.tag, '')
	assert.strictEqual(el.end, '')
	assert.deepStrictEqual(el.children, [])
})

test('MDElement should create with given props', () => {
	const child = new MDElement({ content: 'child' })
	const el = new MDElement({
		content: 'content',
		tag: '<p>',
		end: '</p>',
		children: [child],
	})
	assert.strictEqual(el.content, 'content')
	assert.strictEqual(el.tag, '<p>')
	assert.strictEqual(el.end, '</p>')
	assert.deepStrictEqual(el.children, [child])
})

test('MDElement toHTML should return formatted string', () => {
	const child = new MDElement({ content: 'child', tag: '<span>', end: '</span>' })
	const el = new MDElement({ content: 'content', tag: '<p>', end: '</p>', children: [child] })
	assert.strictEqual(el.toHTML(), '<p>content\n  <span>child</span>\n</p>')
})
