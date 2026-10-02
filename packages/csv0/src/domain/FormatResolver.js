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
