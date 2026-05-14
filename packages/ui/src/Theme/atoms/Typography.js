import { tokens } from '../tokens.js'

/**
 * Theme definition for Typography atom.
 *
 * @typedef {Object} TypographyTheme
 * @property {Object} variants
 */

/**
 * Typography atom theme.
 * @type {TypographyTheme}
 */
export default {
	variants: {
		h1: { fontSize: '2rem', fontWeight: tokens.font.weight.bold },
		h2: { fontSize: '1.75rem', fontWeight: tokens.font.weight.bold },
		h3: { fontSize: '1.5rem', fontWeight: tokens.font.weight.medium },
		h4: { fontSize: '1.25rem', fontWeight: tokens.font.weight.medium },
		h5: { fontSize: '1.125rem', fontWeight: tokens.font.weight.normal },
		h6: { fontSize: '1rem', fontWeight: tokens.font.weight.normal },
		body: { fontSize: tokens.font.size.base, fontWeight: tokens.font.weight.normal },
		small: { fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.normal },
		caption: { fontSize: tokens.font.size.xs, fontWeight: tokens.font.weight.normal },
	},
}
