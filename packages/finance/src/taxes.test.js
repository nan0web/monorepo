import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { UATaxCalculator } from './taxes.js'

describe('UATaxCalculator', () => {
	const calc = new UATaxCalculator()

	it('should calculate taxes for UA correctly', () => {
		const amount = 10000
		const details = calc.getDetails(amount)

		assert.strictEqual(details.pit, 1800)
		assert.strictEqual(details.military, 150)
		assert.strictEqual(details.total, 1950)
	})

	it('should return total tax via calculate method', () => {
		assert.strictEqual(calc.calculate(10000), 1950)
	})
})
