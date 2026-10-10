import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseJSONL, stringifyJSONL } from './index.js'

describe('JSONL utils', () => {
	it('parses lines and skips blanks', () => {
		assert.deepEqual(parseJSONL('{"a":1}\r\n\n{"b":[2]}\n'), [{ a: 1 }, { b: [2] }])
		assert.deepEqual(parseJSONL(''), [])
	})
	it('stringifies arrays and single values', () => {
		assert.equal(stringifyJSONL([{ a: 1 }, { b: 2 }]), '{"a":1}\n{"b":2}')
		assert.equal(stringifyJSONL({ a: 1 }), '{"a":1}')
	})
})
