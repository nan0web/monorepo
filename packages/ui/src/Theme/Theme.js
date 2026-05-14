import * as atoms from './atoms/index.js'
import * as molecules from './molecules/index.js'
import * as organisms from './organisms/index.js'

/**
 * Universal UI theme foundation.
 * Holds atoms, molecules, and organisms styling configs.
 *
 * @typedef {Object} ThemeConfig
 * @property {Partial<typeof atoms>} atoms
 * @property {typeof molecules} molecules
 * @property {typeof organisms} organisms
 */

/**
 * Universal UI theme foundation.
 * Contains styling configurations for all component types.
 *
 * @type {ThemeConfig}
 */
export default {
	atoms,
	molecules,
	organisms,
}
