import React from 'react'
import { Button } from 'react-bootstrap'
import { reactIcon } from '@nan0web/icons/adapters/react'
import { FaSun as _FaSun, FaMoon as _FaMoon } from '@nan0web/icons/fa'
const FaSun = reactIcon(_FaSun)
const FaMoon = reactIcon(_FaMoon)

export const ThemeToggle = ({ theme = 'light', onToggle, className = '' }) => {
	const isDark = theme === 'dark'

	const handleClick = (e) => {
		e.preventDefault()
		if (onToggle) onToggle(isDark ? 'light' : 'dark')
	}

	return (
		<Button
			variant="link"
			className={`nav-link border-0 bg-transparent p-2 d-flex align-items-center ${className}`}
			onClick={handleClick}
			title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
			aria-label="Toggle theme"
		>
			{isDark ? <FaSun size="1.2em" /> : <FaMoon size="1.2em" />}
		</Button>
	)
}

ThemeToggle.inlineRenderer = true
ThemeToggle.displayName = 'ThemeToggle'
