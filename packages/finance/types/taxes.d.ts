/**
 * Base class for tax calculators.
 */
export class TaxCalculator {
    /**
     * Calculates total tax amount.
     * @param {number} amount - Net or gross amount.
     * @returns {number}
     */
    calculate(amount: number): number;
    /**
     * Returns detailed breakdown of taxes.
     * @param {number} amount
     * @returns {object}
     */
    getDetails(amount: number): object;
}
/**
 * Ukraine-specific tax calculator.
 * Includes Personal Income Tax (PIT) and Military Tax.
 */
export class UATaxCalculator extends TaxCalculator {
    PIT_RATE: number;
    MILITARY_RATE: number;
    /**
     * Returns detailed breakdown for Ukraine.
     * @param {number} amount
     * @returns {{ pit: number, military: number, total: number }}
     */
    getDetails(amount: number): {
        pit: number;
        military: number;
        total: number;
    };
}
