/**
 * Base class for tax calculators.
 */
export class TaxCalculator {
	/**
	 * Calculates total tax amount.
	 * @param {number} amount - Net or gross amount.
	 * @returns {number}
	 */
	calculate(amount) {
		return 0
	}

	/**
	 * Returns detailed breakdown of taxes.
	 * @param {number} amount
	 * @returns {object}
	 */
	getDetails(amount) {
		return { total: 0 }
	}
}

/**
 * Ukraine-specific tax calculator.
 * Includes Personal Income Tax (PIT) and Military Tax.
 */
export class UATaxCalculator extends TaxCalculator {
	PIT_RATE = 0.18 // 18%
	MILITARY_RATE = 0.015 // 1.5%

	/**
	 * Calculates total tax amount (PIT + Military).
	 * @param {number} amount - Amount to tax.
	 * @returns {number}
	 */
	calculate(amount) {
		const details = this.getDetails(amount)
		return details.total
	}

	/**
	 * Returns detailed breakdown for Ukraine.
	 * @param {number} amount
	 * @returns {{ pit: number, military: number, total: number }}
	 */
	getDetails(amount) {
		const pit = amount * this.PIT_RATE
		const military = amount * this.MILITARY_RATE
		return {
			pit,
			military,
			total: pit + military,
		}
	}
}
