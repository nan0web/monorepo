import { Model } from '@nan0web/types'
import { show, progress, result } from '@nan0web/ui'
import { createT } from '@nan0web/i18n'
/**
 * @typedef {Object} FieldInfo
 * @property {string | function} [type]
 * @property {string} [hint]
 * @property {string} [help]
 * @property {string} [alias]
 * @property {boolean} [localized]
 * @property {boolean} [required]
 * @property {Array<string | {label:string, value:string} | function>} [options=[]]
 * @property {any} [default]
 */

/**
 * @typedef {Object} CMSClass
 * @property {string} className
 * @property {Object} config
 * @property {boolean} config.isGlobal
 * @property {string | null} config.slug
 * @property {string | null} config.group
 * @property {string} uiSingular
 * @property {string} uiPlural
 * @property {Record<string, FieldInfo>} staticFields
 */

import fs from 'fs'
import path from 'path'

/**
 * TransformModel - Subcommand to transform Model-as-Schema to Payload CMS Collections & Globals
 */
export class TransformModel extends Model {
	static alias = 'transform'

	static UI = {
		title: 'Transform Model-as-Schema to Payload Collections & Globals',
		start: 'Starting Payload CMS collection transformation...',
		scanning: 'Scanning for models in {target}...',
		generated: 'Generated Payload config for {className} -> {output}',
		done: 'Transformation completed successfully! Generated {count} definitions.',
		appLanguagesFound: 'Application has {count} supported languages: {list}',
		errorDb: 'No DB instance found. Cannot run TransformModel command.',
		errorDomainIndex: 'No domain index found. Cannot run TransformModel command.',
	}

	static target = {
		help: 'Target directory containing package.json that exports domain models in { exports: { "domain": "src/domain/index.js" } }',
		default: '.',
		positional: true,
	}

	static output = {
		help: 'Output directory for generated collections',
		default: 'src/collections',
		alias: 'o',
	}

	static force = {
		help: 'Force overwrite existing generated files',
		type: 'boolean',
		default: false,
		alias: 'f',
	}

	/**
	 * @param {Partial<TransformModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory */ this.target
		/** @type {string} Output directory */ this.output
		/** @type {boolean} Force flag */ this.force
	}

	/**
	 * Transform field info to Payload CMS field configuration.
	 * @param {string} fieldName
	 * @param {FieldInfo} fieldInfo
	 */
	transformField(fieldName, fieldInfo) {
		if (!fieldInfo || typeof fieldInfo !== 'object') return null

		/** @type {import('payload').Field | Record<string, any>} */
		const payloadField = { name: fieldName }
		let payloadType = 'text'
		const type = fieldInfo.type

		/** @todo: Визначити як описувати унікальний ключ для посилання на іншу модель */
		if (typeof type === 'function' && Model.isPrototypeOf(type)) {
			payloadType = 'relationship'
			payloadField.relationTo =
				type.$collection || type.$slug || type.name.replace(/Model$/i, '').toLowerCase()
		} else if (fieldInfo.hint === 'upload' || fieldInfo.type === 'media') {
			payloadType = 'upload'
			payloadField.relationTo = 'media'
		} else {
			switch (type) {
				case 'string':
					payloadType = fieldInfo.hint === 'textarea' ? 'textarea' : 'text'
					if (fieldInfo.hint === 'code') payloadType = 'code'
					break
				case 'text/markdown':
				case 'markdown':
					payloadType = 'textarea'
					break
				case 'number':
				case 'integer':
					payloadType = 'number'
					if (fieldInfo.step !== undefined) {
						payloadField.admin = payloadField.admin || {}
						payloadField.admin.step = fieldInfo.step
					} else if (type === 'integer') {
						payloadField.admin = payloadField.admin || {}
						payloadField.admin.step = 1
					}
					break
				case 'boolean':
					payloadType = 'checkbox'
					break
				case 'date':
					payloadType = 'date'
					break
				case 'email':
					payloadType = 'email'
					break
				case 'enum':
					payloadType = fieldInfo.hint === 'radio' ? 'radio' : 'select'
					payloadField.options = fieldInfo.options || []
					break
				case 'string[]':
					payloadType = 'array'
					payloadField.fields = [{ name: 'item', type: 'text' }]
					break
				case 'blocks':
					payloadType = 'blocks'
					if (Array.isArray(fieldInfo.blocks)) {
						payloadField.blocks = fieldInfo.blocks.map((b) => {
							const blockSlug =
								typeof b === 'function'
									? b.name.replace(/Model$/i, '').toLowerCase() + 'block'
									: String(b).toLowerCase()
							const fields =
								typeof b === 'function'
									? Object.entries(b)
											.filter(([k]) => !k.startsWith('$') && k !== 'UI' && typeof k === 'string')
											.map(([k, v]) => this.transformField(k, v))
									: [{ name: 'content', type: 'text' }]
							return {
								slug: blockSlug,
								fields,
							}
						})
					}
					break
				case 'array':
					if (typeof fieldInfo.model === 'function' && Model.isPrototypeOf(fieldInfo.model)) {
						payloadType = 'array'
						const relName =
							fieldInfo.model.$collection ||
							fieldInfo.model.$slug ||
							fieldInfo.model.name.replace(/Model$/i, '').toLowerCase()
						payloadField.fields = [
							{
								name: relName,
								type: 'relationship',
								relationTo: relName,
							},
						]
					} else if (typeof fieldInfo.model === 'string') {
						payloadType = 'array'
						const relName = fieldInfo.model.toLowerCase() + 's'
						payloadField.fields = [
							{
								name: fieldInfo.model.toLowerCase(),
								type: 'relationship',
								relationTo: relName,
							},
						]
					} else if (Array.isArray(fieldInfo.fields)) {
						payloadType = 'array'
						payloadField.fields = fieldInfo.fields
					} else {
						payloadType = 'json'
					}
					break

				case 'object':
					payloadType = 'json'
					break
				default:
					payloadType = 'text'
			}
		}

		payloadField.type = payloadType

		if (fieldInfo.help) {
			payloadField.label = fieldInfo.help
		}

		if (fieldInfo.localized === true) {
			payloadField.localized = true
		}

		if (fieldInfo.required) {
			payloadField.required = true
		}

		if (fieldInfo.default !== undefined) {
			const defaultType = typeof fieldInfo.default
			if (defaultType === 'string' || defaultType === 'number' || defaultType === 'boolean') {
				payloadField.defaultValue = fieldInfo.default
			}
		}

		if (fieldName === 'UI' || fieldName === 'ui') {
			payloadField.admin = payloadField.admin || {}
			payloadField.admin.hidden = true
		}

		if (payloadType === 'checkbox') {
			payloadField.admin = payloadField.admin || {}
			payloadField.admin.components = {
				Cell: '@nan0web/ui-payload#BooleanCell',
			}
		}

		if (
			(fieldName.toLowerCase() === 'image' || fieldName.toLowerCase() === 'ogimage') &&
			payloadType === 'text'
		) {
			payloadField.admin = payloadField.admin || {}
			payloadField.admin.components = {
				Cell: '@nan0web/ui-payload#ImageCell',
			}
		}

		return payloadField
	}

	/**
	 * @todo Must be agnostic, now hardcoded to Javascript package.json
	 * @returns {Promise<Record<string, any> | null>}
	 */
	async requireDomainIndex() {
		const packageFile = '@app/package.json'
		if (!this._.db) return null
		const stat = await this._.db.stat(packageFile)
		if (!stat?.exists) return null
		const pkg = (await this._.db.get(packageFile)) ?? null
		if (!pkg) return null
		const domain = pkg.exports?.domain || pkg.exports?.['./domain'] || null
		if (!domain) return null
		if (domain.import) {
			const targetPath = domain.import.startsWith('.')
				? `${process.cwd()}/${domain.import}`
				: domain.import
			return await import(targetPath)
		}
		if ('string' === typeof domain) {
			const targetPath = domain.startsWith('.') ? `${process.cwd()}/${domain}` : domain
			return await import(targetPath)
		}
		return domain
	}

	/**
	 * @param {Record<string, any>} domainModule
	 * @returns {Array<CMSClass>}
	 */
	readDomainModels(domainModule) {
		const modelsToProcess = []
		for (const [exportedName, exportedItem] of Object.entries(domainModule)) {
			if (typeof exportedItem === 'function' && exportedItem.prototype && exportedItem.UI) {
				const cleanName = exportedName.replace(/Model$/i, '')
				/** @type {Record<string, any>} */
				const staticFields = {}
				for (const [k, v] of Object.entries(exportedItem)) {
					if (
						!k.startsWith('$') &&
						k !== 'UI' &&
						k !== 'length' &&
						k !== 'name' &&
						k !== 'prototype'
					) {
						staticFields[k] = v
					}
				}
				modelsToProcess.push({
					className: exportedName,
					config: {
						isGlobal: Boolean(exportedItem.$single),
						slug: exportedItem.$collection || null,
						group: exportedItem.UI?.$group || exportedItem.$group || null,
					},
					uiSingular: exportedItem.UI?.$singular || cleanName,
					uiPlural: exportedItem.UI?.$plural || cleanName,
					staticFields,
				})
			}
		}
		return modelsToProcess
	}

	/**
	 * @param {CMSClass} model
	 * @param {import('@nan0web/i18n').Language[]} supportedLangs
	 * @param {string} [resolvedOutputDir]
	 * @param {Record<string, import('@nan0web/types').TFunction>} [translators]
	 * @returns {{outputCode: string, outputPath: string}}
	 */
	generateModel(model, supportedLangs, resolvedOutputDir = '', translators = {}) {
		const db = this._.db
		const { className, config, uiSingular, uiPlural, staticFields } = model
		const cleanName = className.replace(/Model$/i, '')
		const slug = config.slug || cleanName.toLowerCase()

		/** @type {Record<string, string>} */
		const singularMap = {}
		/** @type {Record<string, string>} */
		const pluralMap = {}
		for (const lang of supportedLangs) {
			const locale = typeof lang === 'string' ? lang : lang?.locale || 'en'
			const translate = translators[locale] || this._?.t || createT()
			const sVal = translate(`${cleanName}`, { locale })
			const pVal = translate(`${cleanName}.$plural`, { locale })
			singularMap[locale] = sVal && sVal !== `${cleanName}` ? sVal : uiSingular || cleanName
			pluralMap[locale] = pVal && pVal !== `${cleanName}.$plural` ? pVal : uiPlural || cleanName
		}

		const singularJSON = JSON.stringify(singularMap, null, 6).replace(/\n/g, '\n    ')
		const pluralJSON = JSON.stringify(pluralMap, null, 6).replace(/\n/g, '\n    ')

		const group = config.group || undefined
		const groupField = group ? `    group: '${group}',\n` : ''

		const fieldsList = []
		for (const [fieldName, fieldInfo] of Object.entries(staticFields)) {
			if (fieldName.startsWith('$') || fieldName === 'UI') continue
			const payloadField = this.transformField(fieldName, fieldInfo)
			if (payloadField) fieldsList.push(payloadField)
		}

		const fieldsJSON = JSON.stringify(fieldsList, null, 4)

		const defaultCols = []
		const fieldNames = fieldsList.map((f) => f.name)
		const priorities = ['image', 'ogImage', 'url', 'title', 'name', 'code', 'slug', 'updatedAt']
		for (const f of priorities) {
			if (fieldNames.includes(f)) defaultCols.push(f)
		}

		const defaultColsField =
			defaultCols.length > 0 ? `    defaultColumns: ${JSON.stringify(defaultCols)},\n` : ''

		let outputCode = ''
		let outputPath = ''

		if (config.isGlobal) {
			outputCode =
				`/**\n` +
				` * ${cleanName} Global\n` +
				` * Auto-generated from Model-as-Schema\n` +
				` *\n` +
				` * @type {import('payload').GlobalConfig}\n` +
				` */\n` +
				`export const ${cleanName} = {\n` +
				`  slug: '${slug}',\n` +
				`  label: ${singularJSON},\n` +
				`  admin: {\n` +
				`${groupField}` +
				`  },\n` +
				`  access: {\n` +
				`    read: () => true,\n` +
				`    update: ({ req: { user } }) => Boolean(user),\n` +
				`  },\n` +
				`  fields: ${fieldsJSON},\n` +
				`}\n`

			const globalsDir = resolvedOutputDir.replace(/collections\/?$/, 'globals')
			outputPath = path.resolve(globalsDir, `${cleanName}.js`)
		} else {
			outputCode =
				`/**\n` +
				` * ${cleanName} Collection\n` +
				` * Auto-generated from Model-as-Schema\n` +
				` *\n` +
				` * @type {import('payload').CollectionConfig}\n` +
				` */\n` +
				`export const ${cleanName}Collection = {\n` +
				`  slug: '${slug}',\n` +
				`  labels: {\n` +
				`    singular: ${singularJSON},\n` +
				`    plural: ${pluralJSON},\n` +
				`  },\n` +
				`  admin: {\n` +
				`    useAsTitle: '${staticFields.title ? 'title' : staticFields.name ? 'name' : 'id'}',\n` +
				`${defaultColsField}` +
				`${groupField}` +
				`  },\n` +
				`  access: {\n` +
				`    read: () => true,\n` +
				`    create: ({ req: { user } }) => Boolean(user),\n` +
				`    update: ({ req: { user } }) => Boolean(user),\n` +
				`    delete: ({ req: { user } }) => Boolean(user),\n` +
				`  },\n` +
				`  fields: ${fieldsJSON},\n` +
				`}\n`

			outputPath = path.resolve(resolvedOutputDir, `${cleanName}.js`)
		}
		return { outputCode, outputPath }
	}

	/**
	 * Run the subcommand logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) {
			throw new Error(t(TransformModel.UI.errorDb))
		}

		yield progress(t(TransformModel.UI.start))
		const domainModule = await this.requireDomainIndex()
		if (null === domainModule) {
			throw new Error(t(TransformModel.UI.errorDomainIndex))
		}
		yield progress(t(TransformModel.UI.scanning, { count: Object.keys(domainModule).length }))

		const modelsToProcess = this.readDomainModels(domainModule)
		let generatedCount = 0

		const resolvedOutputDir = path.resolve(process.cwd(), this.output)

		const doc = (await db.fetch('@app/app/*/index')) ?? {}
		const doc2 = (await db.fetch('@app/app/index')) ?? {}
		console.log('[DEBUG] keys of doc (*):', Object.keys(doc))
		console.log('[DEBUG] keys of doc2:', Object.keys(doc2))
		if (doc.langs) console.log('[DEBUG] doc.langs:', doc.langs)
		if (doc2.langs) console.log('[DEBUG] doc2.langs:', doc2.langs)
		if (doc.t) console.log('[DEBUG] doc.t:', doc.t)
		if (doc2.t) console.log('[DEBUG] doc2.t:', doc2.t)

		/** @type {import('@nan0web/i18n').Language[]} */
		let supportedLangs =
			Array.isArray(doc.langs) && doc.langs.length > 0
				? doc.langs
				: Array.isArray(doc2.langs)
					? doc2.langs
					: []

		const list = supportedLangs.map((l) => l.title).join(', ')
		yield show(t(TransformModel.UI.appLanguagesFound, { count: supportedLangs.length, list }))

		const { createT } = await import('@nan0web/i18n')
		/** @type {Record<string, import('@nan0web/types').TFunction>} */
		const translators = {}
		const vocab = doc.t || doc2.t || {}

		for (const lang of supportedLangs) {
			const locale = typeof lang === 'string' ? lang : lang?.locale || 'en'
			translators[locale] = createT(vocab, locale)
		}

		const generatedExports = []

		for (const model of modelsToProcess) {
			if (Object.keys(model.staticFields).length === 0 && !model.config.isGlobal) continue

			const { outputCode, outputPath } = this.generateModel(
				model,
				supportedLangs,
				resolvedOutputDir,
				translators
			)

			fs.mkdirSync(path.dirname(outputPath), { recursive: true })
			fs.writeFileSync(outputPath, outputCode, 'utf-8')

			const cleanName = model.className.replace(/Model$/i, '')
			generatedExports.push(`export * from './${cleanName}.js'`)

			generatedCount++

			yield show(
				t(TransformModel.UI.generated, { className: model.className, output: outputPath }),
				'success'
			)
		}

		if (generatedExports.length > 0) {
			const indexContent =
				`// Auto-generated collections index by @nan0web/payload-cms.app\n` +
				`// Do not edit manually\n\n` +
				generatedExports.join('\n') +
				'\n'
			const indexFile = path.resolve(resolvedOutputDir, 'index.js')
			fs.writeFileSync(indexFile, indexContent, 'utf-8')
		}

		yield show(t(TransformModel.UI.done, { count: generatedCount }), 'success')
		return result({ status: 'ok', count: generatedCount })
	}
}
