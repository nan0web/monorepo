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
    static calculateAnnuityPayment(amount: number, yearlyRate: number, termMonths: number): number;
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
    static generateSchedule(amount: number, yearlyRate: number, termMonths: number, options?: {
        differential?: boolean | undefined;
        gracePeriod?: number | undefined;
    }): object[];
}
