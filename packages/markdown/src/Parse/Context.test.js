import { describe, it } from 'node:test'
import assert from 'node:assert'
import ParseContext from './Context.js'

describe('ParseContext', () => {
	it('should create instance with default values', () => {
		const context = new ParseContext()
		assert.strictEqual(context.i, 0)
		assert.strictEqual(context.j, 0)
		assert.deepStrictEqual(context.rows, [])
		assert.deepStrictEqual(context.skipped, [])
	})

	it('should create instance with custom values', () => {
		const context = new ParseContext({
			i: 5,
			j: 10,
			rows: ['row1', 'row2'],
			skipped: ['skipped1', 'skipped2'],
		})
		assert.strictEqual(context.i, 5)
		assert.strictEqual(context.j, 10)
		assert.deepStrictEqual(context.rows, ['row1', 'row2'])
		assert.deepStrictEqual(context.skipped, ['skipped1', 'skipped2'])
	})

	it('should handle partial initialization', () => {
		const context = new ParseContext({ i: 3, rows: ['row1'] })
		assert.strictEqual(context.i, 3)
		assert.strictEqual(context.j, 0)
		assert.deepStrictEqual(context.rows, ['row1'])
		assert.deepStrictEqual(context.skipped, [])
	})

	it('should convert values to numbers', () => {
		const context = new ParseContext({ i: '5', j: '10' })
		assert.strictEqual(context.i, 5)
		assert.strictEqual(context.j, 10)
	})
})
