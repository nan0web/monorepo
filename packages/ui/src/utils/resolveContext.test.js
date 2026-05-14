import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveContext, resolveContextValue } from './resolveContext.js'

describe('resolveContext utility', () => {
	const ctx = {
		data: {
			user: { name: 'John', age: 30 },
			currencies: ['USD', 'EUR', 'UAH'],
			rates: { USD: [38.5, 40.0], EUR: [42.0, 43.5] },
			amount: 1000,
			result: '38500.00',
		},
		actions: {
			save: () => 'saved',
			update: () => 'updated',
		},
		functions: {
			calculate: (a, b, c) => `${a} ${b} → ${c}`,
			format: (x) => `₴${x}`,
		},
	}

	it('passes non-string values unchanged', () => {
		assert.equal(resolveContext(ctx, 123), 123)
		assert.equal(resolveContext(ctx, true), true)
		assert.equal(resolveContext(ctx, null), null)
	})

	it('resolves data:* using Data.find()', () => {
		assert.deepStrictEqual(resolveContext(ctx, 'data:currencies'), ['USD', 'EUR', 'UAH'])
		assert.equal(resolveContext(ctx, 'data:user.name'), 'John')
		assert.equal(resolveContext(ctx, 'data:rates.USD.[0]'), 38.5)
	})

	it('resolves action:* from context.actions', () => {
		assert.equal(resolveContext(ctx, 'action:save'), ctx.actions.save)
		assert.equal(typeof resolveContext(ctx, 'action:update'), 'function')
	})

	it('resolves fn:* with arguments', () => {
		const fn = resolveContext(ctx, 'fn:calculate,100,USD,UAH')
		assert.equal(typeof fn, 'function')
		assert.equal(fn(), '100 USD → UAH')

		const fn2 = resolveContext(ctx, 'fn:format,38500.00')
		assert.equal(fn2(), '₴38500')
	})

	it('interpolates templates {{key}} using Data.find()', () => {
		assert.equal(resolveContext(ctx, 'Hello, {{user.name}}!'), 'Hello, John!')
		assert.equal(
			resolveContext(ctx, '{{amount}} {{currencies.0}} = {{result}}'),
			'1000 USD = 38500.00',
		)
	})

	it('returns original string when template path is not found', () => {
		assert.equal(resolveContext(ctx, 'Missing: {{unknown.path}}'), 'Missing: {{unknown.path}}')
	})

	it('resolveContextValue returns resolved value or undefined', () => {
		assert.equal(resolveContextValue(ctx, 'data:user.name'), 'John')
		assert.equal(resolveContextValue(ctx, 'action:save'), ctx.actions.save)
		assert.equal(resolveContextValue(ctx, 'invalid:path'), undefined)
	})

	it('gracefully handles missing data', () => {
		const result = resolveContext({}, 'data:unknown')
		assert.deepStrictEqual(result, [])
	})
})
