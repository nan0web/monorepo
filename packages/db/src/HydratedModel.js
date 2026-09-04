import { Model } from '@nan0web/types'
import Data from './Data.js'

/**
 * @typedef {Object} AutoHydrated
 * @property {Object} [parent] The parent document.
 * @property {string[]} [auto] The auto field-value mapping from the parent document.
 * @property {string} [$auto] The name of the auto field-value mapping config in the document.
 */
/** @typedef {Partial<import('@nan0web/types').ModelOptions> & AutoHydrated} HydratedModelOptions */

/**
 * HydratedModel
 * Extends base Model to support Model-as-App features:
 * 1. Unminifies properties based on parent document's $index.fields.
 * 2. Resolves Late-Bound string references (e.g., "$files") from parent document.
 * 3. Preserves explicit overrides (e.g. []) while auto-hydrating omitted/undefined/null properties.
 */
export class HydratedModel extends Model {
	/**
	 * @param {Object} [input]
	 * @param {HydratedModelOptions} [options]
	 */
	constructor(input = {}, options = {}) {
		class DataHelper extends Data {
			static OBJECT_DIVIDER = '.'
		}
		let hydratedInput = { ...input }

		// 1. Unminify fields if parent document has an $index definition
		if (options?.parent?.$index?.fields) {
			const fields = options.parent.$index.fields
			for (const [key, alias] of Object.entries(fields)) {
				if (hydratedInput[alias] !== undefined && hydratedInput[key] === undefined) {
					hydratedInput[key] = hydratedInput[alias]
				}
			}
		}

		// 2. Auto-hydrate unprovided fields from options.parent into input
		if (options?.parent && typeof options.parent === 'object') {
			for (const [key, value] of Object.entries(options.parent)) {
				if (!key.startsWith('_') && !key.startsWith('$') && hydratedInput[key] === undefined) {
					hydratedInput[key] = value
				}
			}
		}

		super(hydratedInput, options)

		// 3. Resolve Late-Bound properties and Auto-hydrate from parent
		if (options.parent) {
			const $auto = options.$auto || ''
			const flat = DataHelper.flatten(options.parent)

			// 3.1 Resolve explicit $ references
			for (const [key, value] of Object.entries(this)) {
				const resolveRef = (refKey) => {
					if (options.parent[refKey] !== undefined) return options.parent[refKey]
					if (options.parent[`$${refKey}`] !== undefined) return options.parent[`$${refKey}`]
					if (flat[refKey] !== undefined) return flat[refKey]
					if (flat[`$${refKey}`] !== undefined) return flat[`$${refKey}`]
					if (refKey === '') return options.parent
					return undefined
				}

				if (typeof value === 'string' && value.startsWith('$')) {
					const resolved = resolveRef(value.slice(1))
					if (resolved !== undefined) this[key] = resolved
				} else if (Array.isArray(value)) {
					this[key] = value.flatMap((v) => {
						if (typeof v === 'string' && v.startsWith('$')) {
							const resolved = resolveRef(v.slice(1))
							return resolved !== undefined ? resolved : v
						}
						return v
					})
				}
			}

			// 3.2 Auto-hydrate ALL empty model fields from parent without needing options.auto array
			for (const key of Object.keys(this)) {
				if (key.startsWith('_')) continue // skip internals

				const isProvided =
					Object.prototype.hasOwnProperty.call(hydratedInput, key) &&
					hydratedInput[key] !== undefined &&
					hydratedInput[key] !== null

				if (!isProvided) {
					const autoKey = $auto ? `$${$auto}.${key}` : null
					if (autoKey && flat[autoKey] !== undefined) {
						this[key] = flat[autoKey]
					} else if (options.parent[key] !== undefined) {
						this[key] = options.parent[key]
					}
				}
			}
		}
	}
}
