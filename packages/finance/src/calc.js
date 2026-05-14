/**
 * Checks if a year is a leap year.
 * @param {number} [year] - Year to check. Defaults to current year.
 * @returns {boolean}
 */
export function isLeapYear(year = new Date().getFullYear()) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Calculates interest per day.
 * @param {number} yearlyRate - Yearly interest rate (e.g., 0.15 for 15%).
 * @param {number} [year] - Year for leap year check.
 * @returns {number}
 */
export function calcInterestPerDay(yearlyRate, year = new Date().getFullYear()) {
	return yearlyRate / (isLeapYear(year) ? 366 : 365)
}

/**
 * Calculates commission based on amount and commission rules.
 * @param {number} amount - Principal amount.
 * @param {object} rules - Commission value (rate) or rules object.
 * @param {number} [rules.rate] - Rate (0 to 1).
 * @param {number} [rules.value] - Rate in percent (0 to 100).
 * @param {number} [rules.minAmount] - Minimum commission amount.
 * @param {number} [rules.maxAmount] - Maximum commission amount.
 * @returns {number}
 */
export function calcCommission(amount, rules) {
	if (typeof rules === 'object' && rules !== null) {
		let commissionAmount = 0
		if (typeof rules.rate !== 'undefined') {
			commissionAmount = amount * rules.rate
		} else if (typeof rules.value !== 'undefined') {
			commissionAmount = (amount * rules.value) / 100
		}

		if (typeof rules.minAmount !== 'undefined') {
			commissionAmount = Math.max(commissionAmount, rules.minAmount)
		}
		if (typeof rules.maxAmount !== 'undefined') {
			commissionAmount = Math.min(commissionAmount, rules.maxAmount)
		}
		return commissionAmount
	}
	// Default assume rules is a rate
	return amount * (rules || 0)
}
