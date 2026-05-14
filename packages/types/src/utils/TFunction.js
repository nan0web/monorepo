/**
 * @typedef {(message: string, vars?: Record<string, any>) => string} TFunction
 * @description Translation function. Takes a message key and optional variables for substitution.
 * @param {string} message - The message key or template (e.g. "Hello {name}").
 * @param {Record<string, any>} [vars] - Object with variables to substitute into the template.
 * @returns {string} Localized string.
 */

/**
 * Creates a translation function bound to a specific vocabulary.
 * Supports ICU-like simple variable replacement ({name}) and plural/ordinal suffixes.
 *
 * @param {Object<string, string> | Map<string, string>} [vocab={}] - Mapping from keys to localized strings.
 * @param {string} [locale='en'] - The locale used for plural rules.
 * @returns {TFunction} Translation function.
 *
 * @example
 * ```js
 * const t = createT({ "Hello {name}": "{name}, вітаю!" }, "uk-UA")
 * t("Hello {name}", { name: "Іван" }) // → "Іван, вітаю!"
 * ```
 */
export function createT(vocab = {}, locale = 'en') {
	const map =
		vocab instanceof Map ? vocab : new Map(Array.isArray(vocab) ? vocab : Object.entries(vocab))

	let pluralRules
	let ordinalRules

	/**
	 * Internal translator to check if key exists.
	 */
	function translate(key, vars = {}) {
		let finalKey = key

		if (vars && typeof vars === 'object') {
			if ('$count' in vars) {
				if (!pluralRules) pluralRules = new Intl.PluralRules(locale)
				const category = pluralRules.select(vars.$count)
				const countKey = `${key}_${category}`
				if (map.has(countKey)) {
					finalKey = countKey
				} else if (category === 'other' && map.has(`${key}_other`)) {
					finalKey = `${key}_other`
				}
			} else if ('$ordinal' in vars) {
				if (!ordinalRules) ordinalRules = new Intl.PluralRules(locale, { type: 'ordinal' })
				const category = ordinalRules.select(vars.$ordinal)
				const ordKey = `${key}_${category}`
				if (map.has(ordKey)) {
					finalKey = ordKey
				} else if (category === 'other' && map.has(`${key}_other`)) {
					finalKey = `${key}_other`
				}
			}
		}

		const template = map.has(finalKey) ? String(map.get(finalKey)) : String(key)
		const found = map.has(finalKey)

		if (!vars || typeof vars !== 'object') return { template, found }

		const result = template.replace(/\{([^}]+)\}/g, (_, name) => {
			if (Object.prototype.hasOwnProperty.call(vars, name)) {
				const val = vars[name]
				if (typeof val === 'number') {
					// recursive translation shorthand ONLY if variable name is NOT the current key
					// (to prevent infinite loops in templates like day_one: "{day}st day")
					if (name !== key) {
						const sub = translate(name, { $count: val, count: val })
						if (sub.found) return sub.template
					}
					return String(val)
				}
				if (val && typeof val === 'object' && ('$count' in val || '$ordinal' in val)) {
					return translate(name, val).template
				}
				return String(val)
			}
			return `{${name}}`
		})

		return { template: result, found }
	}

	return function t(key, vars = {}) {
		return translate(key, vars).template
	}
}

