import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { LoanEngine } from './loan.js'

describe('LoanEngine', () => {
	describe('calculateAnnuityPayment', () => {
		it('should calculate correct annuity payment', () => {
			const amount = 10000
			const rate = 0.12 // 12%
			const term = 12 // 1 year
			const payment = LoanEngine.calculateAnnuityPayment(amount, rate, term)
			assert.ok(Math.abs(payment - 888.49) < 0.01)
		})
	})

	describe('generateSchedule', () => {
		it('should generate schedule for 12 months', () => {
			const schedule = LoanEngine.generateSchedule(10000, 0.12, 12)
			assert.strictEqual(schedule.length, 12)
			assert.strictEqual(schedule[11].remainingBalance, 0)
		})

		it('should respect grace period', () => {
			const schedule = LoanEngine.generateSchedule(10000, 0.12, 12, { gracePeriod: 2 })
			assert.strictEqual(schedule[0].bodyPayment, 0)
			assert.strictEqual(schedule[1].bodyPayment, 0)
			assert.ok(schedule[2].bodyPayment > 0)
		})

		it('should support differential payments', () => {
			const schedule = LoanEngine.generateSchedule(10000, 0.12, 10, { differential: true })
			assert.strictEqual(schedule[0].bodyPayment, 1000)
			assert.strictEqual(schedule[1].bodyPayment, 1000)
		})
	})
})
