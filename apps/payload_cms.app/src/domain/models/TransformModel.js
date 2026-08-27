import { Model, ROLES, DEFAULT_ACCESS } from '@nan0web/types'
import { show, progress, result } from '@nan0web/ui'
import { createT } from '@nan0web/i18n'
import { PayloadCollectionTemplate } from '@nan0web/ui-payload/templates'

/**
 * @typedef {Object} FieldInfo
 * @property {string | function} [type]
 * @property {string} [hint]
 * @property {string} [help]
 * @property {string} [alias]
 * @property {boolean} [localized]
 * @property {boolean} [required]
 * @property {{position?: string, width?: string}} [admin]
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

	static include = {
		help: 'Include filter for models (comma-separated names or substring, e.g. "Card,Deposit")',
		type: 'string',
		default: '*',
		alias: 'i',
	}

	static exclude = {
		help: 'Exclude filter for models (comma-separated names to skip)',
		type: 'string',
		default: '',
		alias: 'e',
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
		/** @type {string} Include filter */ this.include
		/** @type {string} Exclude filter */ this.exclude
	}

	/**
	 * Filters models by include and exclude rules.
	 * @param {Array<CMSClass>} modelsToProcess
	 * @returns {Array<CMSClass>}
	 */
	filterModels(modelsToProcess) {
		const inc = this.include || '*'
		const exc = this.exclude || ''

		const incList = inc !== '*' ? inc.split(',').map((s) => s.trim().toLowerCase()) : null
		const excList = exc ? exc.split(',').map((s) => s.trim().toLowerCase()) : []

		return modelsToProcess.filter((m) => {
			const name = m.className.toLowerCase()
			const cleanName = name.replace(/model$/i, '')

			if (excList.length > 0 && excList.some((e) => name.includes(e) || cleanName.includes(e))) {
				return false
			}
			if (incList) {
				return incList.some((i) => name.includes(i) || cleanName.includes(i))
			}
			return true
		})
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
		let type = fieldInfo.type

		/** @todo: Визначити як описувати унікальний ключ для посилання на іншу модель */
		if (typeof type === 'function' && Model.isPrototypeOf(type)) {
			payloadType = 'relationship'
			payloadField.relationTo =
				type.$collection || type.$slug || type.name.replace(/Model$/i, '').toLowerCase()
			if (fieldInfo.hasMany || fieldInfo.array) {
				payloadField.hasMany = true
			}
		} else if (type === 'relationship' || type === 'relation') {
			payloadType = 'relationship'
			if (fieldInfo.relationTo) {
				payloadField.relationTo = fieldInfo.relationTo
			} else if (typeof fieldInfo.model === 'function' && Model.isPrototypeOf(fieldInfo.model)) {
				payloadField.relationTo =
					fieldInfo.model.$collection || fieldInfo.model.$slug || fieldInfo.model.name.replace(/Model$/i, '').toLowerCase()
			}
			if (fieldInfo.hasMany || fieldInfo.array) {
				payloadField.hasMany = true
			}
		} else if (fieldInfo.hint === 'upload' || fieldInfo.type === 'media') {
			payloadType = 'upload'
			payloadField.relationTo = 'media'
		} else {
			if (!type && Array.isArray(fieldInfo.default)) {
				type = 'array'
			}
			switch (type) {
				case 'string':
					payloadType = fieldInfo.hint === 'textarea' ? 'textarea' : 'text'
					if (fieldInfo.hint === 'code') payloadType = 'code'
					break
				case 'text/markdown':
				case 'markdown':
					payloadType = 'textarea'
					break
				case 'richtext':
				case 'richText':
					payloadType = 'richText'
					payloadField.editor = lexicalEditor({
						features: ({ defaultFeatures }) => [...defaultFeatures],
					})
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
					payloadType = 'array'
					if (typeof fieldInfo.model === 'function' && Model.isPrototypeOf(fieldInfo.model)) {
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
						const relName = fieldInfo.model.toLowerCase() + 's'
						payloadField.fields = [
							{
								name: fieldInfo.model.toLowerCase(),
								type: 'relationship',
								relationTo: relName,
							},
						]
					} else if (Array.isArray(fieldInfo.fields)) {
						payloadField.fields = fieldInfo.fields
					} else {
						payloadField.fields = [{ name: 'item', type: 'text' }]
					}
					break

				case 'object':
				case 'json':
					payloadType = 'json'
					break
				default:
					payloadType = 'text'
			}
		}

		payloadField.type = payloadType

		if (fieldInfo.help) {
			payloadField.label =
				typeof fieldInfo.help === 'object'
					? fieldInfo.help
					: { uk: fieldInfo.help, en: fieldInfo.help }
		}

		if (fieldInfo.localized === true) {
			payloadField.localized = true
		}

		if (fieldInfo.admin && typeof fieldInfo.admin === 'object') {
			payloadField.admin = { ...fieldInfo.admin }
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
		const db = this._.db
		let targetDir = this.target || '.'
		if (targetDir.startsWith('--')) {
			targetDir = '.'
		}

		// 1. Try loading from mounted DB instance first (for unit tests / mock DBs)
		if (db) {
			try {
				const packageFile = '@app/package.json'
				const stat = await db.stat(packageFile)
				if (stat?.exists) {
					const pkg = (await db.get(packageFile)) ?? null
					if (pkg) {
						const domain = pkg.exports?.domain || pkg.exports?.['./domain'] || null
						if (domain) {
							if (typeof domain === 'object' && !domain.import) {
								return domain
							}
							let relPath = typeof domain === 'string' ? domain : domain.import || ''
							if (relPath) {
								const resolvedTarget = path.isAbsolute(targetDir)
									? targetDir
									: path.resolve(process.cwd(), targetDir)
								const targetPath = relPath.startsWith('.')
									? path.resolve(resolvedTarget, relPath)
									: relPath
								return await import(targetPath)
							}
						}
					}
				}
			} catch (e) {
				// Ignore DB read errors and fall back to filesystem
			}
		}

		// 2. Fall back to node:fs resolution relative to target or monorepo root
		let resolvedTarget = path.isAbsolute(targetDir)
			? targetDir
			: path.resolve(process.cwd(), targetDir)

		let packagePath = path.resolve(resolvedTarget, 'package.json')
		const { existsSync, readFileSync } = await import('node:fs')

		if (!existsSync(packagePath)) {
			const monorepoRootPath = path.resolve(process.cwd(), '../../', targetDir, 'package.json')
			if (existsSync(monorepoRootPath)) {
				packagePath = monorepoRootPath
				resolvedTarget = path.dirname(monorepoRootPath)
			}
		}

		if (!existsSync(packagePath)) return null

		const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
		const domain = pkg.exports?.domain || pkg.exports?.['./domain'] || null
		if (!domain) return null

		let relPath = ''
		if (typeof domain === 'string') {
			relPath = domain
		} else if (domain.import) {
			relPath = domain.import
		}

		if (relPath) {
			const targetPath = relPath.startsWith('.')
				? path.resolve(resolvedTarget, relPath)
				: relPath
			try {
				return await import(targetPath)
			} catch (err) {
				console.error('[TransformModel] Failed to import domain index:', targetPath, err)
				return null
			}
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
		const { db, t } = this._
		if (!db) {
			throw new Error(t(TransformModel.UI.errorDb))
		}
		const { className, config, uiSingular, uiPlural, staticFields } = model
		const cleanName = className.replace(/Model$/i, '')
		const slug = config.slug || cleanName.toLowerCase()

		/** @type {Record<string, string>} */
		const singularMap = {}
		/** @type {Record<string, string>} */
		const pluralMap = {}
		const langs = supportedLangs.length > 0 ? supportedLangs : [{ locale: 'en', title: 'English' }]
		for (const lang of langs) {
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
			outputPath = db.resolveSync(globalsDir, `${cleanName}.js`)
		} else {
			/** @type {Record<string, string>} */
			const groupMap = {}
			for (const lang of langs) {
				const locale = typeof lang === 'string' ? lang : lang?.locale || 'en'
				const translate = translators[locale] || this._?.t || createT()
				const gVal = group ? translate(`$group.${group}`, { locale }) : ''
				groupMap[locale] = gVal && !gVal.startsWith('$group.') ? gVal : group || 'Content'
			}

			const useAsTitle = staticFields.title ? 'title' : staticFields.name ? 'name' : 'id'
			const groupName = typeof group === 'string' ? group : groupMap['uk'] || groupMap['en'] || 'Content'
			const collectionTemplate = new PayloadCollectionTemplate({
				collectionSlug: slug,
				useAsTitle,
				labels: { singular: singularMap, plural: pluralMap },
				group: groupName,
				fields: fieldsList,
			})
			outputCode = collectionTemplate.compileSync()
			outputPath = db.resolveSync(resolvedOutputDir, `${cleanName}.js`)
		}
		return { outputCode, outputPath }
	}

	/**
	 * Reads context metadata (languages and vocabulary) via db.
	 * @returns {Promise<{supportedLangs: import('@nan0web/i18n').Language[], vocab: Record<string, any>}>}
	 */
	async readContextData() {
		const db = this._.db
		if (!db)
			return {
				supportedLangs: [
					{ locale: 'uk', title: 'Українська' },
					{ locale: 'en', title: 'English' },
				],
				vocab: {},
			}
		let doc = (await db.fetch('@app/index')) ?? (await db.fetch('@app/package.json')) ?? {}
		if (!doc.langs || !Array.isArray(doc.langs) || doc.langs.length === 0) {
			doc =
				(await db.fetch('@app/../bank/app/index')) ??
				(await db.fetch('bank/app/index')) ??
				(await db.fetch('../bank/app/index')) ??
				doc
		}
		let supportedLangs = Array.isArray(doc.langs) ? doc.langs : []
		if (supportedLangs.length === 0) {
			supportedLangs = [
				{ locale: 'uk', title: 'Українська' },
				{ locale: 'en', title: 'English' },
			]
		}
		const vocab = doc.t || {}
		return { supportedLangs, vocab }
	}

	/**
	 * Creates translator TFunctions per supported language locale.
	 * @param {import('@nan0web/i18n').Language[]} supportedLangs
	 * @param {Record<string, any>} vocab
	 * @returns {Promise<Record<string, import('@nan0web/types').TFunction>>}
	 */
	async resolveSupportedLanguages(supportedLangs, vocab) {
		const { createT } = await import('@nan0web/i18n')
		/** @type {Record<string, import('@nan0web/types').TFunction>} */
		const translators = {}
		for (const lang of supportedLangs) {
			const locale = typeof lang === 'string' ? lang : lang?.locale || 'en'
			translators[locale] = createT(vocab, locale)
		}
		return translators
	}

	/**
	 * Writes generated model definitions and index via database instance.
	 * @param {Array<{cleanName: string, outputCode: string, isGlobal: boolean}>} definitions
	 * @param {string} outputDir
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, number, any>}
	 */
	async *writeOutputs(definitions, outputDir) {
		const db = this._.db
		const t = this._.t
		let count = 0
		const generatedExports = []

		for (const { cleanName, outputCode, isGlobal } of definitions) {
			const subDir = isGlobal ? 'globals' : 'collections'
			const uri = `@app/${outputDir}/${subDir}/${cleanName}.js`
			if (db) {
				await db.saveDocument(uri, outputCode)
			}
			generatedExports.push(`export { collectionConfig as ${cleanName} } from './${cleanName}.js'`)
			count++
			yield show(t(TransformModel.UI.generated, { className: cleanName, output: uri }), 'success')
		}

		if (generatedExports.length > 0 && db) {
			const indexContent =
				`// Auto-generated collections index by @nan0web/payload-cms.app\n` +
				`// Do not edit manually\n\n` +
				generatedExports.join('\n') +
				'\n'
			await db.saveDocument(`@app/${outputDir}/collections/index.js`, indexContent)
		}

		return count
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

		const modelsToProcess = this.filterModels(this.readDomainModels(domainModule))

		// 1. Read context metadata
		const { supportedLangs, vocab } = await this.readContextData()
		const list = supportedLangs
			.map((l) => (typeof l === 'string' ? l : l.title || l.locale))
			.join(', ')
		yield show(t(TransformModel.UI.appLanguagesFound, { count: supportedLangs.length, list }))

		// 2. Resolve translators
		const translators = await this.resolveSupportedLanguages(supportedLangs, vocab)

		// 3. Generate model code definitions
		const definitions = []
		for (const model of modelsToProcess) {
			if (Object.keys(model.staticFields).length === 0 && !model.config.isGlobal) continue
			const { outputCode } = this.generateModel(model, supportedLangs, this.output, translators)
			const cleanName = model.className.replace(/Model$/i, '')
			definitions.push({ cleanName, outputCode, isGlobal: Boolean(model.config.isGlobal) })
		}

		// 4. Write outputs agnostically
		const generatedCount = yield* this.writeOutputs(definitions, this.output)

		yield show(t(TransformModel.UI.done, { count: generatedCount }), 'success')
		return result({ status: 'ok', count: generatedCount })
	}
}
