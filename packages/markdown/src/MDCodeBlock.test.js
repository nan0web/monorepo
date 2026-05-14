import { describe, it } from 'node:test'
import assert from 'node:assert'
import MDCodeBlock from './MDCodeBlock.js'

describe('MDCodeBlock', () => {
	it('should create with default language empty', () => {
		const code = new MDCodeBlock({ content: 'code', tag: '<pre>', end: '</pre>' })
		assert.strictEqual(code.language, '')
		assert.strictEqual(code.content, 'code')
	})

	it('should create with language', () => {
		const code = new MDCodeBlock({ content: 'code', tag: '<pre>', end: '</pre>', language: 'js' })
		assert.strictEqual(code.language, 'js')
		assert.strictEqual(String(code), '```js\ncode\n```\n')
	})

	it('should stringify proper code block', () => {
		const code = new MDCodeBlock({ content: 'code', language: 'js' })
		assert.strictEqual(String(code), '```js\ncode\n```\n')
	})
})
