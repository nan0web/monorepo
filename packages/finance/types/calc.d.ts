/**
 * Checks if a year is a leap year.
 * @param {number} [year] - Year to check. Defaults to current year.
 * @returns {boolean}
 */
export function isLeapYear(year?: number): boolean;
/**
 * Calculates interest per day.
 * @param {number} yearlyRate - Yearly interest rate (e.g., 0.15 for 15%).
 * @param {number} [year] - Year for leap year check.
 * @returns {number}
 */
export function calcInterestPerDay(yearlyRate: number, year?: number): number;
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
export function calcCommission(amount: number, rules: {
    rate?: number | undefined;
    value?: number | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}): number;
