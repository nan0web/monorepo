import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import { NightTheme } from '@nan0web/ui'
import { UIProvider, useUI } from '../../context/UIContext.jsx'

describe('Night theme button toggle', () => {
	it('toggles between light Theme and NightTheme', () => {
		const ThemeIndicator = () => {
			const { theme } = useUI()
			return <div data-testid="indicator" data-theme={theme === NightTheme ? 'night' : 'light'} />
		}

		const { getByText, getByTestId } = render(
			<UIProvider>
				<ThemeSwitcher />
				<ThemeIndicator />
			</UIProvider>,
		)

		const btn = getByText('Theme')
		const indicator = getByTestId('indicator')

		// initial – light
		expect(indicator.getAttribute('data-theme')).toBe('light')

		// first click → NightTheme
		fireEvent.click(btn)
		expect(indicator.getAttribute('data-theme')).toBe('night')

		// second click → back to light
		fireEvent.click(btn)
		expect(indicator.getAttribute('data-theme')).toBe('light')
	})
})
