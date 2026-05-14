import { merge } from '@nan0web/types'
import Theme from './Theme.js'

/**
 * Creates a theme instance with merged configuration.
 *
 * @param {Partial<import('./Theme.js').ThemeConfig>} overrides
 * @returns {import('./Theme.js').ThemeConfig}
 */
export function createTheme(overrides = {}) {
	/**
	 * This function uses merge from @nan0web/types to create a new theme.
	 * It ensures nested theme properties like atoms, molecules, organisms are deeply merged.
	 */
	const base = {
		atoms: { ...Theme.atoms },
		molecules: { ...Theme.molecules },
		organisms: { ...Theme.organisms },
	}

	return merge(base, overrides)
}
