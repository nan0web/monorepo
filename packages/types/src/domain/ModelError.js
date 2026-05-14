export default class ModelError extends Error {
	/**
	 * @param {Record<string, any>} fields - Map of field names to their validation error messages or translation configs.
	 */
	constructor(fields) {
		const message = Object.values(fields)
			.map((v) => (Array.isArray(v) ? v.join(' ') : v))
			.join('\n---\n')
		super(message)
		this.name = 'ModelError'
		this.fields = fields
	}

	static from(str) {
		const arr = String(str).split('\n---\n')
		return new ModelError(Object.assign({}, arr))
	}

	/**
	 * Translate the error fields using a translation function.
	 * @param {import('../utils/TFunction.js').TFunction} t - The translation function, e.g. t(key, params)
	 * @returns {ModelError} - A new ModelError with translated fields.
	 */
	translate(t) {
		const translatedFields = {}
		const meta = Object.fromEntries(
			Object.entries(this.fields).filter(([key]) => key.startsWith('$')),
		)
		const fields = Object.entries(this.fields).filter(([key]) => !key.startsWith('$'))

		for (const [key, value] of fields) {
			translatedFields[key] = Array.isArray(value) ? t(value[0], value[1]) : t(value, meta)
		}
		return new ModelError(translatedFields)
	}
}
