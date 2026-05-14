import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { DocsParser, DatasetParser } from '@nan0web/test'
import {
	isLeapYear,
	calcInterestPerDay,
	calcCommission,
	formatAmount,
	formatRate,
	formatNumber,
	UATaxCalculator,
	LoanEngine,
} from './index.js'

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/finance
	 *
	 * Financial logic, formatting, and calculations for nan0web platforms.
	 * This package provides reliable tools for banking, credit, and tax calculations,
	 * with a focus on precision and local requirements (like Ukraine taxes).
	 *
	 * ## Installation
	 */
	it('How to install?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/finance
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/finance')
	})

	/**
	 * @docs
	 * ## Formatting Utilities
	 *
	 * ### `formatAmount(value, currency, locale, options)`
	 * Formats numbers, arrays, or {min, max} objects as currency strings or ranges.
	 */
	it('How to format currency range?', () => {
		const range = { min: 1000, max: 5000 }
		const formatted = formatAmount(range, 'UAH', 'uk-UA')
		// Example: "1 000,00 ₴ — 5 000,00 ₴"
		assert.ok(formatted.includes('—'))
		assert.ok(formatted.includes('₴'))
	})

	/**
	 * @docs
	 * ### `formatRate(value, locale)`
	 * Formats fractional numbers as percentage strings.
	 */
	it('How to format percentage?', () => {
		const rate = 0.125
		const formatted = formatRate(rate, 'en-US')
		// Example: "12.5%"
		assert.equal(formatted, '12.5%')
	})

	/**
	 * @docs
	 * ## Calculations
	 *
	 * ### `calcCommission(amount, rules)`
	 * Calculates commission based on fixed rates or complex rules (min/max).
	 */
	it('How to calculate commission with limit?', () => {
		const rules = { value: 1, maxAmount: 50 } // 1%, max 50
		const res = calcCommission(10000, rules)
		// 1% of 10000 is 100, but max is 50
		assert.equal(res, 50)
	})

	/**
	 * @docs
	 * ## Ukraine-specific Taxes
	 *
	 * ### `UATaxCalculator`
	 * Calculates Personal Income Tax (18%) and Military Tax (1.5%).
	 */
	it('How to calculate UA taxes?', () => {
		const calc = new UATaxCalculator()
		const details = calc.getDetails(10000)
		assert.equal(details.pit, 1800)
		assert.equal(details.military, 150)
		assert.equal(details.total, 1950)
	})

	/**
	 * @docs
	 * ## Loan Engine
	 *
	 * ### `LoanEngine.generateSchedule(amount, rate, term, options)`
	 * Generates amortization schedule for annuity or differential payments.
	 */
	it('How to generate loan schedule?', () => {
		const schedule = LoanEngine.generateSchedule(10000, 0.12, 12, { gracePeriod: 2 })
		assert.equal(schedule.length, 12)
		assert.equal(schedule[0].bodyPayment, 0) // Grace period
		assert.ok(schedule[11].bodyPayment > 0)
		assert.equal(schedule[11].remainingBalance, 0)
	})
}

describe('@nan0web/finance README.md generation suite', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`Document is rendered in README.md [${format(Buffer.byteLength(text))} bytes]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(text.includes('# @nan0web/finance'))
		assert.ok(text.includes('## Formatting Utilities'))
	})
})
