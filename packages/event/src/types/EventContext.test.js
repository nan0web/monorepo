import { describe, it } from 'node:test'
import assert from 'node:assert'
import EventContext from './EventContext.js'

describe('EventContext', () => {
	it('should initialize with default values', () => {
		const ctx = new EventContext()
		assert.strictEqual(ctx.type, '')
		assert.strictEqual(ctx.name, '')
		assert.strictEqual(ctx.error, null)
		assert.strictEqual(ctx.data, undefined)
		assert.strictEqual(ctx.defaultPrevented, false)
		assert.deepStrictEqual(ctx.meta, {})
	})

	it('should prevent default', () => {
		const ctx = new EventContext()
		assert.strictEqual(ctx.defaultPrevented, false)
		ctx.preventDefault()
		assert.strictEqual(ctx.defaultPrevented, true)
	})

	it('should clone correctly', () => {
		const original = new EventContext({
			type: 'test',
			name: 'example',
			data: { value: 42 },
			meta: { count: 1 },
			error: null,
			defaultPrevented: true,
		})

		const clone = original.clone()

		assert.deepStrictEqual(clone.type, original.type)
		assert.deepStrictEqual(clone.name, original.name)
		assert.deepStrictEqual(clone.data, original.data)
		assert.deepStrictEqual(clone.meta, original.meta)
		assert.deepStrictEqual(clone.error, original.error)
		assert.deepStrictEqual(clone.defaultPrevented, original.defaultPrevented)
		assert.notStrictEqual(clone, original)
		assert.notStrictEqual(clone.meta, original.meta)
		// Check that preventDefault method is properly bound in clone
		assert.notStrictEqual(clone.preventDefault, original.preventDefault)
	})

	it('should create from another context', () => {
		const original = new EventContext({ type: 'test', data: 'hello' })
		const fromContext = EventContext.from(original)
		assert.strictEqual(fromContext, original)

		const fromObject = EventContext.from({ type: 'new', data: 'world' })
		assert.notStrictEqual(fromObject, original)
		assert.strictEqual(fromObject.type, 'new')
		assert.strictEqual(fromObject.data, 'world')
	})
})
