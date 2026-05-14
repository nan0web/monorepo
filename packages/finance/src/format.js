/**
 * Formats a number using Intl.NumberFormat.
 * @param {number} amount - The numeric value to format.
 * @param {string} [currency] - Optional currency code (e.g., 'UAH', 'USD').
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @param {Object} [options] - Additional formatting options.
 * @param {number} [options.decimals] - Number of decimal places.
 * @returns {string}
 */
export function formatNumber(amount, currency = undefined, locale = 'uk-UA', options = {}) {
	const castOptions = /** @type {any} */ (options)
	const decimals = typeof castOptions.decimals === 'number' ? castOptions.decimals : 2

	const formatOptions = {
		style: currency ? 'currency' : 'decimal',
		currency: currency,
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}

	// @ts-ignore
	let formatted = new Intl.NumberFormat(locale, formatOptions).format(amount)

	// Custom replacement for legacy currency symbols if needed
	if (currency === 'UAH' && formatted.includes('грн')) {
		formatted = formatted.replace('грн', '₴')
	}

	return formatted
}

/**
 * Formats an amount which can be a number, an array (range), or an object {min, max}.
 * @param {number|number[]|Object} value - Value to format.
 * @param {string} [currency] - Optional currency code.
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @param {Object} [options]
 * @returns {string}
 */
export function formatAmount(value, currency = undefined, locale = 'uk-UA', options = {}) {
	if (Array.isArray(value)) {
		return value.map((v) => formatAmount(v, currency, locale, options)).join(' — ')
	}

	if (typeof value === 'object' && value !== null) {
		const val = /** @type {any} */ (value)
		const min = val.min !== undefined ? formatAmount(val.min, currency, locale, options) : ''
		const max = val.max !== undefined ? formatAmount(val.max, currency, locale, options) : ''
		return min && max ? `${min} — ${max}` : min || max || ''
	}

	const numericValue = typeof value === 'string' ? parseFloat(value) : value
	// @ts-ignore
	return !isNaN(numericValue) ? formatNumber(numericValue, currency, locale, options) : String(value)
}

/**
 * Formats a rate which can be a number or an object {minRate, maxRate}.
 * @param {number|Object} value - Rate value.
 * @param {string} [locale='uk-UA'] - Locale identifier.
 * @returns {string}
 */
export function formatRate(value, locale = 'uk-UA') {
	if (typeof value === 'object' && value !== null) {
		const val = /** @type {any} */ (value)
		const min = val.minRate !== undefined ? formatRate(val.minRate, locale) : ''
		const max = val.maxRate !== undefined ? formatRate(val.maxRate, locale) : ''
		return min && max ? `${min} — ${max}` : min || max || ''
	}

	let numericValue = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(numericValue)) return String(value)

	// If rate is delivered as decimal (e.g. 0.15 for 15%), convert to percent
	if (numericValue < 1 && numericValue > 0) {
		numericValue = numericValue * 100
	}

	return new Intl.NumberFormat(locale, {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(numericValue / 100)
}

/**
 * Formats a range using a custom divider and formatter.
 * @param {Object} range - Range object {min, max}.
 * @param {string} [divider=' — '] - Divider string.
 * @param {Function} [formatter=formatAmount] - Formatter function.
 * @param {string} [currency]
 * @returns {string|null}
 */
export function formatRange(range, divider = ' — ', formatter = formatAmount, currency = undefined) {
	if (!range) return null
	const r = /** @type {any} */ (range)
	const minStr = r.min !== undefined ? formatter(r.min, currency) : null
	const maxStr = r.max !== undefined ? formatter(r.max, currency) : null

	if (minStr && maxStr) return `${minStr}${divider}${maxStr}`
	return minStr || maxStr || null
}
