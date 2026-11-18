import { getMetadata } from '@nan0web/types'

const META_ROW_FIELDS = new Set(['slug', 'type', 'status', 'currency'])
const DATE_ROW_FIELDS = new Set(['starts_at', 'ends_at'])

const TYPE_MAP = {
	string: 'text',
	text: 'text',
	textarea: 'textarea',
	number: 'number',
	integer: 'number',
	boolean: 'checkbox',
	date: 'date',
	email: 'email',
	json: 'json',
	richtext: 'richText',
	richText: 'richText',
	upload: 'upload',
	media: 'upload',
	relationship: 'relationship',
	array: 'array',
	object: 'group',
}

/**
 * Runtime translator from `@nan0web/types` Model-as-Schema definitions
 * into Payload CMS `CollectionConfig` objects.
 */
export class CollectionBuilder {
	/**
	 * Extracts raw field definitions from a Model class or plain schema object.
	 * @param {Function|Record<string, any>} target
	 * @returns {Record<string, any>}
	 */
	static getSchema(target) {
		if (!target) return {}
		if (typeof target === 'function') {
			if (target.schema && typeof target.schema === 'object') {
				return target.schema
			}
			const meta = getMetadata(target)
			if (meta && typeof meta === 'object') {
				return meta
			}
		}
		if (typeof target === 'object') {
			return target.schema || target
		}
		return {}
	}

	/**
	 * Normalizes select options to Payload format.
	 * @param {Array<string|{label: string, value: string}>} options
	 * @returns {Array<{label: string, value: string}>}
	 */
	static normalizeOptions(options) {
		return options.map((opt) =>
			typeof opt === 'object' && opt !== null ? opt : { label: String(opt), value: String(opt) },
		)
	}

	/**
	 * Builds a single Payload field config from a Model-as-Schema field definition.
	 * @param {string} name
	 * @param {Record<string, any>} [def={}]
	 * @param {Record<string, any>} [options={}]
	 * @returns {Record<string, any>}
	 */
	static buildField(name, def = {}, options = {}) {
		const field = { name }

		if (Array.isArray(def.options) && def.options.length > 0) {
			field.type = 'select'
			field.options = CollectionBuilder.normalizeOptions(def.options)
		} else if (def.type === 'array') {
			field.type = 'array'
			field.fields = def.model ? CollectionBuilder.buildFields(def.model, options) : []
		} else if (def.type === 'object') {
			field.type = 'group'
			field.fields = def.model ? CollectionBuilder.buildFields(def.model, options) : []
		} else if (typeof def.type === 'function') {
			field.type = def.hasMany ? 'array' : 'group'
			field.fields = CollectionBuilder.buildFields(def.type, options)
		} else if (def.type === 'richtext' || def.type === 'richText') {
			field.type = 'richText'
			if (options.editor) {
				field.editor = options.editor
			}
		} else if (def.hint === 'textarea') {
			field.type = 'textarea'
		} else {
			field.type = TYPE_MAP[def.type] || 'text'
		}

		if (def.required !== undefined) field.required = Boolean(def.required)
		if (def.default !== undefined) field.defaultValue = def.default
		if (def.admin !== undefined) field.admin = def.admin
		if (def.relationTo !== undefined) field.relationTo = def.relationTo
		if (def.hasMany !== undefined) field.hasMany = def.hasMany
		if (def.localized !== undefined) field.localized = def.localized

		return field
	}

	/**
	 * Builds Payload fields array from a Model class or schema object,
	 * grouping meta fields and date range fields into `row` containers.
	 * @param {Function|Record<string, any>} target
	 * @param {Record<string, any>} [options={}]
	 * @returns {Array<Record<string, any>>}
	 */
	static buildFields(target, options = {}) {
		const schema = CollectionBuilder.getSchema(target)
		const metaRow = []
		const dateRow = []
		const regularFields = []

		for (const [name, def] of Object.entries(schema)) {
			if (!def || typeof def !== 'object') continue
			const field = CollectionBuilder.buildField(name, def, options)
			if (META_ROW_FIELDS.has(name)) {
				metaRow.push(field)
			} else if (DATE_ROW_FIELDS.has(name)) {
				dateRow.push(field)
			} else {
				regularFields.push(field)
			}
		}

		const result = []
		if (metaRow.length >= 2) {
			result.push({ type: 'row', fields: metaRow })
		} else {
			result.push(...metaRow)
		}

		if (dateRow.length >= 2) {
			result.push({ type: 'row', fields: dateRow })
		} else {
			result.push(...dateRow)
		}

		result.push(...regularFields)
		return result
	}

	/**
	 * Builds a Payload `CollectionConfig` from a Model class.
	 * @param {Function|Record<string, any>} ModelClass
	 * @param {Record<string, any>} [options={}]
	 * @returns {Record<string, any>}
	 */
	static buildCollection(ModelClass, options = {}) {
		const { editor, slug: explicitSlug, ...restOptions } = options
		const slug =
			explicitSlug ||
			ModelClass?.$collection ||
			ModelClass?.slug ||
			(typeof ModelClass?.name === 'string' ? ModelClass.name.toLowerCase() : 'collection')

		const fields = CollectionBuilder.buildFields(ModelClass, { editor })

		return {
			slug,
			...restOptions,
			fields,
		}
	}
}

/**
 * Converts an array or map of Model classes into Payload `CollectionConfig` objects.
 * @param {Array<Function>|Record<string, Function>} models
 * @param {Record<string, any>} [options={}]
 * @returns {Array<Record<string, any>>}
 */
export function buildCollectionsFromModels(models, options = {}) {
	if (Array.isArray(models)) {
		return models.map((ModelClass) => CollectionBuilder.buildCollection(ModelClass, options))
	}
	if (models && typeof models === 'object') {
		return Object.entries(models).map(([slug, ModelClass]) =>
			CollectionBuilder.buildCollection(ModelClass, { ...options, slug }),
		)
	}
	return []
}
