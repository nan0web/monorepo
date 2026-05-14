import { isLeapYear } from './calc.js'

/**
 * Calculations for loans.
 */
export class LoanEngine {
	/**
	 * Calculates monthly payment for annuity loan.
	 * @param {number} amount - Principal amount.
	 * @param {number} yearlyRate - Yearly interest rate (decimal).
	 * @param {number} termMonths - Term in months.
	 * @returns {number}
	 */
	static calculateAnnuityPayment(amount, yearlyRate, termMonths) {
		const monthlyRate = yearlyRate / 12
		if (monthlyRate === 0) return amount / termMonths
		const x = Math.pow(1 + monthlyRate, termMonths)
		return (amount * monthlyRate * x) / (x - 1)
	}

	/**
	 * Generates amortization schedule.
	 * @param {number} amount - Principal amount.
	 * @param {number} yearlyRate - Yearly interest rate (decimal).
	 * @param {number} termMonths - Term in months.
	 * @param {object} [options]
	 * @param {boolean} [options.differential=false] - Use differential payments.
	 * @param {number} [options.gracePeriod=0] - Grace period in months (no body payment).
	 * @returns {object[]}
	 */
	static generateSchedule(amount, yearlyRate, termMonths, options = {}) {
		const { differential = false, gracePeriod = 0 } = options
		const schedule = []
		let remainingBalance = amount
		const monthlyInterestRate = yearlyRate / 12

		const annuityPayment = differential
			? 0
			: this.calculateAnnuityPayment(amount, yearlyRate, termMonths - gracePeriod)
		const baseBodyPayment = amount / (termMonths - gracePeriod)

		for (let month = 1; month <= termMonths; month++) {
			const interestPayment = remainingBalance * monthlyInterestRate
			let bodyPayment = 0

			if (month > gracePeriod) {
				bodyPayment = differential ? baseBodyPayment : annuityPayment - interestPayment
			}

			// Adjust last payment to close exactly at 0
			if (month === termMonths) {
				bodyPayment = remainingBalance
			}

			const totalPayment = bodyPayment + interestPayment
			remainingBalance -= bodyPayment

			schedule.push({
				month,
				totalPayment,
				bodyPayment,
				interestPayment,
				remainingBalance: Math.max(0, remainingBalance),
			})
		}

		return schedule
	}
}
