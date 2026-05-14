/**
 * Обробляє i18n та замінює змінні в тексті.
 * @param {any} input - Вміст для обробки.
 * @param {Function} [t] - Функція перекладу.
 * @param {Object} [data] - Дані для підстановки.
 * @returns {any}
 */
export function processI18n(input, t, data = {}) {
	// If input is an object with $t property
	if (input && typeof input === 'object' && input.$t) {
		if (t) input = t(input.$t)
		else input = input.$t
	}

	// Process string content
	if (typeof input === 'string') {
		return input.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '—')
	}

	// Process arrays recursively
	if (Array.isArray(input)) {
		return input.map((item) => processI18n(item, t, data))
	}

	// Return input as is for other types
	return input
}
