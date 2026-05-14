import React from 'react'

/**
 * Price — displays a large price label.
 * Localized "Price:" vs "Ціна:" automatically via locale.
 * @param {Object} props
 * @param {Object} props.doc
 * @param {string} props.locale
 */
export function Price({ doc, locale }) {
	const price = doc?.doc?.price || doc?.price
	if (!price) return null

	let displayPrice = price
	let displayCurrency = ''

	if (typeof price === 'object' && price !== null) {
		displayPrice = price.value || price.amount || ''
		displayCurrency = price.currency || ''

		const view = doc?.$price?.view || doc?.doc?.$price?.view
		if (view === 'symbol') {
			switch (displayCurrency) {
				case 'USD':
					displayCurrency = '$'
					break
				case 'EUR':
					displayCurrency = '€'
					break
				case 'UAH':
					displayCurrency = '₴'
					break
				case 'GBP':
					displayCurrency = '£'
					break
			}
		}
	}

	return (
		<div className="container container-max py-3">
			<div className="d-flex h2 gap-3">
				<span>{locale === 'uk' ? 'Ціна' : 'Price'}:</span>
				<span className="fw-bold text-primary">
					{displayPrice}{' '}
					{displayCurrency && <span className="text-muted ms-1 fs-4">{displayCurrency}</span>}
				</span>
			</div>
		</div>
	)
}
