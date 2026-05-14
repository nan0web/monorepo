import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatNumber, formatAmount, formatRate, formatRange } from './format.js'

describe('format utils', () => {
	describe('formatNumber', () => {
		it('should format number as currency by default if currency provided', () => {
			const formatted = formatNumber(1234.56, 'UAH')
			assert.ok(formatted.includes('1'), 'Should contain numbers')
			assert.ok(
				formatted.includes('₴') || formatted.includes('UAH'),
				'Should contain currency info',
			)
		})
	})

	describe('formatAmount', () => {
		it('should format amount as currency', () => {
			const formatted = formatAmount(1000, 'USD', 'en-US')
			assert.ok(formatted.includes('$'), 'Should contain $ sign')
		})

		it('should format arrays as ranges', () => {
			const formatted = formatAmount([100, 200], 'UAH')
			assert.ok(formatted.includes('—'), 'Should contain range divider')
		})

		it('should format {min, max} objects as ranges', () => {
			const formatted = formatAmount({ min: 100, max: 200 }, 'UAH')
			assert.ok(formatted.includes('—'), 'Should contain range divider')
		})
	})

	describe('formatRate', () => {
		it('should format percentage', () => {
			const formatted = formatRate(0.125, 'en-US')
			assert.ok(formatted.includes('12.5'), 'Should contain value')
			assert.ok(formatted.includes('%'), 'Should contain % sign')
		})

		it('should treat values >= 1 as percentages (e.g. 15 -> 15%)', () => {
			const formatted = formatRate(15, 'en-US')
			assert.ok(formatted.includes('15'), 'Should contain 15')
			assert.ok(formatted.includes('%'), 'Should contain %')
		})
	})

	describe('formatRange', () => {
		it('should format range with custom divider', () => {
			const range = { min: 10, max: 20 }
			const formatted = formatRange(range, ' to ', (v) => formatNumber(v, 'UAH', 'en-US'))
			assert.ok(formatted.includes('10.00'), 'Should contain 10.00')
			assert.ok(formatted.includes('20.00'), 'Should contain 20.00')
			assert.ok(formatted.includes(' to '), 'Should contain custom divider')
		})
	})
})
