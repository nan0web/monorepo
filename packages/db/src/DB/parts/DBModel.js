import DBFetch from './DBFetch.js'

/**
 * Model hydration and validation layer for the database.
 * Handles model registration, data hydration, and schema validation.
 * Extends DBFetch to add model-level operations.
 *
 * @class
 * @extends {DBFetch}
 */
export default class DBModel extends DBFetch {
	/**
	 * Registers a Model class for a URI prefix.
	 * When fetch() returns data, it will be hydrated through the Model.
	 * @param {string} prefix - URI prefix (e.g. 'users', 'config')
	 * @param {Function} ModelClass - Class with `from(data)` or constructor(data)
	 */
	model(prefix, ModelClass) {
		const normalized = this.normalize(prefix).replace(/\/$/, '') || '/'
		this.models.set(normalized, ModelClass)
		this.models = new Map([...this.models.entries()].sort((a, b) => b[0].length - a[0].length))
	}

	/**
	 * Finds the registered Model for a given URI using longest-prefix matching.
	 * @param {string} uri
	 * @returns {Function | null}
	 */
	_findModel(uri) {
		const normalized = this.normalize(uri)
		for (const [prefix, ModelClass] of this.models) {
			if (prefix === '/' || normalized === prefix || normalized.startsWith(prefix + '/')) {
				return ModelClass
			}
		}
		return null
	}

	/**
	 * Hydrates raw data through the registered Model.
	 * Tries Model.from(data) first, then new Model(data).
	 * @param {any} data
	 * @param {any} ModelClass
	 * @returns {any}
	 */
	_hydrate(data, ModelClass) {
		if (data == null || typeof data !== 'object') return data
		if (typeof ModelClass.from === 'function') return ModelClass.from(data)
		return new ModelClass(data)
	}

	/**
	 * Validates data against the registered Model schema.
	 * Model static fields with `{ help, default }` shape are treated as schema.
	 * Returns an object with `valid` boolean and `errors` array.
	 *
	 * @param {string} uri - Document URI to find the matching Model
	 * @param {any} [data] - Data to validate (if omitted, fetches from storage)
	 * @returns {Promise<{ valid: boolean, errors: Array<{ field: string, message: string }> }>}
	 */
	async validate(uri, data) {
		const ModelClass = this._findModel(uri)
		if (!ModelClass) return { valid: true, errors: [] }

		if (data === undefined) {
			data = await this.get(uri)
		}

		const errors = []

		if (data == null || typeof data !== 'object') {
			return { valid: false, errors: [{ field: '*', message: 'Data is not an object' }] }
		}

		// Collect all field descriptors from the prototype chain
		const schema = new Map()
		let current = ModelClass
		const restricted = new Set(['arguments', 'caller', 'callee', 'prototype'])
		while (current && current !== Object) {
			for (const key of Object.getOwnPropertyNames(current)) {
				if (restricted.has(key)) continue
				try {
					const descriptor = current[key]
					if (
						descriptor &&
						typeof descriptor === 'object' &&
						'default' in descriptor &&
						!schema.has(key)
					) {
						schema.set(key, descriptor)
					}
				} catch {
					// Skip properties that cannot be accessed
				}
			}
			current = Object.getPrototypeOf(current)
		}

		// Check each field against the collected schema
		for (const [key, descriptor] of schema) {
			const expected = typeof descriptor.default
			if (key in data) {
				const actual = typeof data[key]
				if (expected !== 'object' && actual !== expected) {
					errors.push({
						field: key,
						message: `Expected ${expected}, got ${actual}`,
					})
				}
			}
		}

		return { valid: errors.length === 0, errors }
	}
}
