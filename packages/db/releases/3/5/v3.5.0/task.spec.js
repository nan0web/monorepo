import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB, { parseJSONL, stringifyJSONL } from '../../../../src/index.js'

describe('Release v3.5.0 Contract: Pure JSONL Helpers in @nan0web/db', () => {
	describe('1. parseJSONL Contract', () => {
		it('1.1 parses JSONL text into an array of parsed objects', () => {
			const text = '{"id":1,"name":"Alpha"}\n{"id":2,"name":"Beta"}'
			const result = parseJSONL(text)
			assert.deepEqual(result, [
				{ id: 1, name: 'Alpha' },
				{ id: 2, name: 'Beta' },
			])
		})

		it('1.2 skips blank lines and handles CRLF windows line endings', () => {
			const text = '{"a":1}\r\n\n  \r\n{"b":2}\n'
			const result = parseJSONL(text)
			assert.deepEqual(result, [{ a: 1 }, { b: 2 }])
		})

		it('1.3 returns empty array on empty input or null', () => {
			assert.deepEqual(parseJSONL(''), [])
			assert.deepEqual(parseJSONL(null), [])
			assert.deepEqual(parseJSONL(undefined), [])
		})
	})

	describe('2. stringifyJSONL Contract', () => {
		it('2.1 stringifies an array of objects into newline-delimited JSON', () => {
			const input = [{ a: 1 }, { b: 'str' }]
			const result = stringifyJSONL(input)
			assert.equal(result, '{"a":1}\n{"b":"str"}')
		})

		it('2.2 wraps single item into an array and stringifies', () => {
			const input = { single: true }
			assert.equal(stringifyJSONL(input), '{"single":true}')
		})
	})

	describe('3. Main Package Exports', () => {
		it('3.1 exports parseJSONL and stringifyJSONL from package entrypoint', () => {
			assert.equal(typeof parseJSONL, 'function')
			assert.equal(typeof stringifyJSONL, 'function')
			assert.ok(DB)
		})
	})
})
