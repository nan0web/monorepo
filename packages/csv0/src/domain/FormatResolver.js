import { BuiltinFormats } from './formats/index.js'
import { StringFormat } from './formats/StringFormat.js'

/**
 * FormatResolver - class responsible for resolving column formats,
 * supporting builtins, custom instances, and external imports via db/package specifiers.
 */
export class FormatResolver {
	/**
	 * @param {object} [options]
	 * @param {any} [options.db] Injected database instance
	 * @param {Record<string, any>} [options.customFormats] Custom format registry
	 */
	constructor(options = {}) {
		this.db = options.db || null
		this.customFormats = options.customFormats || {}
	}

	/**
	 * Resolves a model class and returns its schema or column definition map.
	 * @param {string | Function} modelRef
	 * @returns {Record<string, any> | null}
	 */
	resolveModelSchema(modelRef) {
		let ModelClass = null
		if (typeof modelRef === 'function') {
			ModelClass = modelRef
		} else if (typeof modelRef === 'string') {
			if (this.customFormats[modelRef]) {
				ModelClass = this.customFormats[modelRef]
			}
		}

		if (!ModelClass) return null

		const schema = {}
		// 1. If Model has explicit static schema
		if (ModelClass.schema && typeof ModelClass.schema === 'object') {
			return ModelClass.schema
		}

		// 2. Extract from static properties (Model-as-Schema pattern)
		for (const key of Object.getOwnPropertyNames(ModelClass)) {
			if (['length', 'name', 'prototype'].includes(key)) continue
			const prop = ModelClass[key]
			if (prop && typeof prop === 'object' && (prop.type || prop.help || prop.default !== undefined)) {
				schema[key] = prop
			}
		}

		return Object.keys(schema).length > 0 ? schema : null
	}

	/**
	 * Resolves a format synchronously from builtins or custom registry.
	 * @param {string | Function | object} type
	 * @param {any} [options]
	 * @returns {import('./Format.js').Format}
	 */
	resolveSync(type, options = {}) {
		if (typeof type === 'function') {
			return new type(options)
		}

		if (type && typeof type === 'object') {
			if (typeof type.stringify === 'function' && typeof type.parse === 'function') {
				return type
			}
			if (type.type) {
				return this.resolveSync(type.type, { ...type, ...options })
			}
		}

		if (typeof type === 'string') {
			if (this.customFormats[type]) {
				const custom = this.customFormats[type]
				return typeof custom === 'function' ? new custom(options) : custom
			}

			const Builtin = BuiltinFormats[type]
			if (Builtin) {
				return new Builtin(options)
			}
		}

		return new StringFormat(options)
	}

	/**
	 * Resolves a format asynchronously, supporting dynamic external module imports or db schemas.
	 * @param {string | Function | object} type
	 * @param {any} [options]
	 * @returns {Promise<import('./Format.js').Format>}
	 */
	async resolve(type, options = {}) {
		if (typeof type === 'function') {
			return new type(options)
		}

		if (type && typeof type === 'object') {
			if (typeof type.stringify === 'function' && typeof type.parse === 'function') {
				return type
			}
			if (type.type) {
				return this.resolve(type.type, { ...type, ...options })
			}
		}

		if (typeof type === 'string') {
			if (this.customFormats[type]) {
				const custom = this.customFormats[type]
				return typeof custom === 'function' ? new custom(options) : custom
			}

			const Builtin = BuiltinFormats[type]
			if (Builtin) {
				return new Builtin(options)
			}

			// Try dynamic external format import if contains slash or @ (e.g. '@company/pkg/format/csv0')
			if (type.includes('/') || type.startsWith('@')) {
				try {
					const mod = await import(type)
					const FormatClass = mod.default || mod.Format || Object.values(mod)[0]
					if (typeof FormatClass === 'function') {
						return new FormatClass(options)
					}
				} catch (err) {
					// Fallback to default
				}
			}
		}

		return new StringFormat(options)
	}
}

export const defaultResolver = new FormatResolver()
