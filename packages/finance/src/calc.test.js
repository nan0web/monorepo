import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isLeapYear, calcInterestPerDay, calcCommission } from './calc.js'

describe('calc utils', () => {
	describe('isLeapYear', () => {
		it('should return true for leap years', () => {
			assert.strictEqual(isLeapYear(2024), true)
			assert.strictEqual(isLeapYear(2000), true)
		})

		it('should return false for non-leap years', () => {
			assert.strictEqual(isLeapYear(2023), false)
			assert.strictEqual(isLeapYear(1900), false)
		})
	})

	describe('calcInterestPerDay', () => {
		it('should calculate interest based on 366 days for leap year', () => {
			const rate = 0.366
			assert.strictEqual(calcInterestPerDay(rate, 2024), 0.001)
		})

		it('should calculate interest based on 365 days for non-leap year', () => {
			const rate = 0.365
			assert.strictEqual(calcInterestPerDay(rate, 2023), 0.001)
		})
	})

	describe('calcCommission', () => {
		it('should calculate fixed rate commission', () => {
			assert.strictEqual(calcCommission(1000, 0.05), 50)
		})

		it('should calculate commission from rules object with percent value', () => {
			assert.strictEqual(calcCommission(1000, { value: 5 }), 50)
		})

		it('should respect minAmount', () => {
			assert.strictEqual(calcCommission(1000, { value: 5, minAmount: 100 }), 100)
		})

		it('should respect maxAmount', () => {
			assert.strictEqual(calcCommission(1000, { value: 5, maxAmount: 20 }), 20)
		})
	})
})
