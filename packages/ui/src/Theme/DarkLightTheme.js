import { createTheme } from './createTheme.js'

/**
 * Theme that automatically switches between light/dark modes.
 */
export default class DarkLightTheme {
	/** @type {Object} */
	static light = {
		background: '#fff',
		text: '#000',
	}

	/** @type {Object} */
	static dark = {
		background: '#000',
		text: '#fff',
	}

	/** @type {string} */
	static current = 'auto' // "light", "dark", or "auto"

	/**
	 * Gets active theme (light, dark, or system preference).
	 * @returns {Object}
	 */
	static getActiveTheme() {
		if (this.current === 'light') return this.light
		if (this.current === 'dark') return this.dark

		// @ts-ignore
		const isDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches
		return isDark ? this.dark : this.light
	}
}
