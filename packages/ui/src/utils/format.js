export const format = {
	currency: (value, currency = 'UAH', locale = 'uk-UA') => {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			maximumFractionDigits: 0
		}).format(value).replace(/,/g, ' ')
	},
	rate: (value, locale = 'uk-UA') => {
		const rate = value < 1 ? value * 100 : value
		return new Intl.NumberFormat(locale, {
			style: 'percent',
			maximumFractionDigits: 2
		}).format(rate / 100)
	},
	number: (value, locale = 'uk-UA') => {
		return new Intl.NumberFormat(locale, {
			maximumFractionDigits: 2
		}).format(value).replace(/,/g, ' ')
	}
}
