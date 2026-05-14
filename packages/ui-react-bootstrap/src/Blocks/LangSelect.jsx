import React from 'react'
import { Dropdown } from 'react-bootstrap'

export const LangSelect = ({ locale = 'uk', langs = [], onChange, className = '' }) => {
	// langs format: [{ code: 'uk', title: 'Українська' }, { code: 'en', title: 'English' }]
	const defaultLangs = [
		{ code: 'uk', title: 'Українська' },
		{ code: 'en', title: 'English' },
	]

	const options = langs.length > 0 ? langs : defaultLangs
	const current = options.find((l) => l.code === locale) || options[0]

	return (
		<Dropdown className={className}>
			<Dropdown.Toggle
				variant="link"
				id="lang-select-dropdown"
				className="nav-link text-decoration-none d-flex align-items-center gap-1 border-0 bg-transparent"
			>
				<span className="text-uppercase fw-semibold">{current.code}</span>
			</Dropdown.Toggle>

			<Dropdown.Menu align="end">
				{options.map((lang) => (
					<Dropdown.Item
						key={lang.code}
						active={lang.code === locale}
						onClick={() => onChange && onChange(lang.code)}
					>
						{lang.title}
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	)
}

LangSelect.inlineRenderer = true
LangSelect.displayName = 'LangSelect'
