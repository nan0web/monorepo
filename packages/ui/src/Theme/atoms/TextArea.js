import Input from './Input.js'

/**
 * Theme definition for TextArea atom.
 *
 * @typedef {Object} TextAreaTheme
 * @property {string} height
 */

/**
 * TextArea atom theme.
 * @type {TextAreaTheme & import("./Input.js").InputTheme}
 */
export default {
	...Input,
	height: '6rem',
}
