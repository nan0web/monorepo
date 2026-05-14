import { test } from 'node:test'
import assert from 'node:assert'
import MDSpace from './MDSpace.js'

test('MDSpace should create instance with default newline content', () => {
	const space = new MDSpace()
	assert.strictEqual(space.content, '\n')
	assert.strictEqual(space.tag, '')
	assert.strictEqual(space.end, '')
	assert.strictEqual(String(space), '\n')
})

test('MDSpace should allow custom empty space content', () => {
	const custom = new MDSpace({ content: '\n\n' })
	assert.strictEqual(custom.content, '\n\n')
	assert.strictEqual(String(custom), '\n\n')
})
