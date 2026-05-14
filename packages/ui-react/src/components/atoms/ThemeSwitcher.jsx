import React from 'react'
import PropTypes from 'prop-types'
import { NightTheme, Theme } from '@nan0web/ui'
import { useUI } from '../../context/UIContext.jsx'
import Button from './Button.jsx'

/**
 * Simple switcher to toggle between light and night (dark) theme.
 * Uses Button atom for consistent styling.
 *
 * @param {Object} props
 * @param {string} [props.label='Theme'] - Button label.
 * @param {Object} [props.style] - Additional styles.
 * @param {Function} [props.onClick] - Additional click handler.
 * @param {React.ReactNode} [props.children] - Children content (e.g. from Element text).
 */
export default function ThemeSwitcher({ label = 'Theme', style, onClick, children } = {}) {
	const { theme, setTheme } = useUI() || {}

	console.debug('ThemeSwitcher rendered with label:', label)
	console.debug('Current theme in ThemeSwitcher:', theme)

	const toggle = () => {
		if (!setTheme) {
			console.debug('No setTheme function in context')
			return
		}
		console.debug('ThemeSwitcher: Toggle theme requested')
		const newTheme = theme === Theme ? NightTheme : Theme
		console.debug('ThemeSwitcher: Switching theme from', theme, 'to', newTheme)
		setTheme(newTheme)
		if (onClick) {
			console.debug('ThemeSwitcher: Calling additional onClick handler')
			onClick()
		}
	}

	// Handle case where children is boolean [true] from Element flag parsing
	// If children is provided and valid text/element, use it. Otherwise fallback to label.
	const content = (Array.isArray(children) && children[0] === true) ? null : children
	const displayLabel = content || label || 'Theme'

	return (
		<Button
			onClick={toggle}
			style={{ margin: '0.5rem', ...style }}
			variant="secondary"
			outline={theme === NightTheme} // Outline in dark mode? Or consistent? Let's stick to secondary solid.
		>
			{displayLabel}
		</Button>
	)
}

ThemeSwitcher.propTypes = {
	label: PropTypes.string,
	style: PropTypes.object,
	onClick: PropTypes.func,
	children: PropTypes.node,
}
