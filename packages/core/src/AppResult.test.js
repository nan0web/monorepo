import { test, describe } from 'node:test'
import { deepEqual, strictEqual, ok } from 'node:assert'
import AppResult from './AppResult.js'

describe('AppResult', () => {
	test('constructor creates instance with string content', () => {
		const result = new AppResult({
			content: 'Test content',
			priority: 1,
			meta: { test: true },
		})

		deepEqual(result.content, ['Test content'])
		strictEqual(result.priority, 1)
		deepEqual(result.meta, { test: true })
		strictEqual(result.error, null)
	})

	test('constructor creates instance with array content', () => {
		const result = new AppResult({
			content: ['Line 1', 'Line 2'],
			priority: 2,
		})

		deepEqual(result.content, ['Line 1', 'Line 2'])
		strictEqual(result.priority, 2)
		deepEqual(result.meta, {})
		strictEqual(result.error, null)
	})

	test('static from() returns same instance if AppResult provided', () => {
		const original = new AppResult({ content: 'test' })
		const result = AppResult.from(original)

		strictEqual(result, original)
	})

	test('static from() creates new instance if plain object provided', () => {
		const input = { content: 'test' }
		const result = AppResult.from(input)

		ok(result instanceof AppResult)
		deepEqual(result.content, ['test'])
	})
})
