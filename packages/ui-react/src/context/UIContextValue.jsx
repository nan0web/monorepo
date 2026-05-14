import AppCore from '@nan0web/core'
import { Theme } from '@nan0web/ui'
import DB from '@nan0web/db-browser'

/**
 * @typedef {Function} SyncImport
 * @template T
 * @description () => T
 */

/**
 * @typedef {Function} AsyncImport
 * @template T
 * @description () => Promise<{ default: T } | T>
 */

/**
 * @typedef {T | SyncImport<T> | AsyncImport<T>} Loadable
 * @template T
 */

/**
 * Tiny context UI for all components.
 */
class UIContextValue {
	/**
	 * @param {Object} [input]
	 * @param {typeof Theme} [input.theme]
	 * @param {string} [input.lang]
	 * @param {DB} [input.db]
	 * @param {boolean} [input.reducedMotion]
	 * @param {object} [input.data]
	 * @param {Function} [input.setTheme]
	 * @param {import('@nan0web/types').TFunction} [input.t]
	 * @param {Function} [input.renderFn]
	 * @param {Console} [input.console]
	 * @param {Map<string, Loadable<React.ComponentType>>} [input.components]
	 * @param {Map<string, Loadable<Function>>} [input.renderers]
	 * @param {Map<string, Loadable<typeof AppCore>>} [input.apps]
	 * @param {Record<string, Function>} [input.actions] - UI actions
	 * @param {any} [input.document] - The document object
	 * @param {boolean} [input.debug] - Show debug logs
	 */
	constructor(input = {}) {
		const {
			theme = Theme,
			lang = 'en',
			db = new DB(),
			reducedMotion = false,
			setTheme = () => {},
			t = /** @type {any} */ ((k) => k),
			data = {},
			renderFn = () => null,
			console: consoleInitial = console,
			components = new Map(),
			renderers = new Map(),
			apps = new Map(),
			actions = {},
			document = null,
			debug = false,
			...rest
		} = input

		this.theme = theme
		this.lang = lang
		this.db = db
		this.debug = Boolean(debug)
		this.document = document
		this.reducedMotion = Boolean(reducedMotion)
		this.setTheme = this.#proxy('setTheme', typeof setTheme === 'function' ? setTheme : () => {})
		this.console = consoleInitial
		const safeT = typeof t === 'function' ? t : (k) => k
		this.t = this.debug ? this.#proxy('t', safeT) : safeT
		this.renderFn = renderFn
		this.components =
			components instanceof Map
				? components
				: new Map(Array.isArray(components) ? components : Object.entries(components))
		this.renderers =
			renderers instanceof Map
				? renderers
				: new Map(Array.isArray(renderers) ? renderers : Object.entries(renderers))
		this.apps =
			apps instanceof Map ? apps : new Map(Array.isArray(apps) ? apps : Object.entries(apps))
		Object.values(actions).forEach((fn) => {
			if ('function' !== typeof fn) {
				throw new TypeError('All actions must be functions')
			}
		})
		this.apps.forEach((fn) => {
			if ('function' !== typeof fn) {
				throw new TypeError('All apps must be lazy functions')
			}
		})
		this.actions = actions
		this.data = data

		// assign the rest without changes
		Object.assign(this, rest)
	}

	#proxy(target, fn) {
		return (...args) => {
			this.console.debug(target, ...args)
			return fn(...args)
		}
	}

	/**
	 * Extend current context and returns new context value.
	 * @param {Object} overrides
	 * @returns {UIContextValue}
	 */
	extend(overrides = {}) {
		if (this.debug) {
			this.console.debug('UIContextValue.extend', overrides)
		}
		return new UIContextValue({
			...this,
			...overrides,
		})
	}

	/**
	 * @param {any} input
	 * @returns {UIContextValue}
	 */
	static from(input) {
		if (input instanceof UIContextValue) return input
		return new UIContextValue(input)
	}
}

export default UIContextValue
