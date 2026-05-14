import React from 'react'

export const LangSelect = ({ locale = 'uk', langs = [], onChange, className = '' }) => {
	// langs format: [{ code: 'uk', title: 'Українська' }, { code: 'en', title: 'English' }]
	const defaultLangs = [
		{ code: 'uk', title: 'Українська' },
		{ code: 'en', title: 'English' },
	]

	const options = langs.length > 0 ? langs : defaultLangs
	return (
		<select
			className={`form-select form-select-sm border-0 bg-transparent text-uppercase fw-semibold ${className}`}
			style={{
				width: 'auto',
				outline: 'none',
				cursor: 'pointer',
				appearance: 'none',
				paddingRight: '1rem',
			}}
			value={locale}
			onChange={(e) => onChange && onChange(e.target.value)}
		>
			{options.map((lang) => (
				<option key={lang.code} value={lang.code}>
					{lang.code.toUpperCase()} — {lang.title}
				</option>
			))}
		</select>
	)
}

LangSelect.inlineRenderer = true
LangSelect.displayName = 'LangSelect'
