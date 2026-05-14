import React from 'react'

import { FaSun, FaMoon } from 'react-icons/fa'

export const ThemeToggle = ({ theme = 'light', onToggle, className = '' }) => {
	const isDark = theme === 'dark'

	const handleClick = (e) => {
		e.preventDefault()
		if (onToggle) onToggle(isDark ? 'light' : 'dark')
	}

	return (
		<button
			type="button"
			className={`nav-link border-0 bg-transparent p-2 d-flex align-items-center ${className}`}
			onClick={handleClick}
			title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
			aria-label="Toggle theme"
		>
			{isDark ? React.createElement(/** @type {any} */ (FaSun), { size: "1.2em" }) : React.createElement(/** @type {any} */ (FaMoon), { size: "1.2em" })}
		</button>
	)
}

ThemeToggle.inlineRenderer = true
ThemeToggle.displayName = 'ThemeToggle'
