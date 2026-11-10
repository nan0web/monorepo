import ts from 'typescript'
import { Model, NaN0 } from '@nan0web/types'

/**
 * @typedef {Object} MemberInfo
 * @property {string} name
 * @property {string} [type]
 * @property {string} [returnType]
 * @property {string[]} [parameters]
 * @property {boolean} [isAsync]
 * @property {boolean} [isStatic]
 * @property {string} [description]
 * @property {Record<string, any>} [schema]
 */

/**
 * @typedef {Object} ClassContract
 * @property {string} name
 * @property {string} [description]
 * @property {MemberInfo[]} [fields]
 * @property {MemberInfo[]} [methods]
 */

/**
 * FastApiDiscovery — High-speed AST extraction of class declarations, fields, and method contracts.
 */
export class FastApiDiscovery extends Model {
	/**
	 * @param {Object} [data]
	 * @param {Object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {import('@nan0web/db').DB} Injected DB */
		this.$db = options.db || data.db
	}

	/**
	 * Extracts API contract from TypeScript/JavaScript source string.
	 * @param {string} source
	 * @param {Object} [options]
	 * @param {string} [options.fileName]
	 * @param {string} [options.level] 'classes' | 'methods' | 'fields' | 'all'
	 * @param {string} [options.only] 'static' | 'async' | 'methods' | 'fields'
	 * @param {boolean} [options.includeDeps]
	 * @returns {{ exports: Record<string, ClassContract>, deps?: string[] }}
	 */
	extractFromSource(source, options = {}) {
		const fileName = options.fileName || 'source.d.ts'
		const sourceFile = ts.createSourceFile(
			fileName,
			source,
			ts.ScriptTarget.Latest,
			true // setParentNodes
		)

		const level = options.level || 'all'
		const only = options.only || null
		const includeDeps = Boolean(options.includeDeps)

		/** @type {Record<string, ClassContract>} */
		const exports = {}
		/** @type {string[]} */
		const deps = []

		/**
		 * Helper to get JSDoc comments from node.
		 * @param {ts.Node} node
		 * @returns {string}
		 */
		const getJsDocComment = (node) => {
			const jsDoc = /** @type {any} */ (node).jsDoc
			if (Array.isArray(jsDoc) && jsDoc.length > 0) {
				const comments = jsDoc
					.map((doc) => {
						if (typeof doc.comment === 'string') return doc.comment
						if (Array.isArray(doc.comment)) {
							return doc.comment.map((c) => c.text).join('')
						}
						return ''
					})
					.filter(Boolean)
				return comments.join('\n').trim()
			}
			return ''
		}

		for (const statement of sourceFile.statements) {
			// Extract imports for deps
			if (includeDeps && ts.isImportDeclaration(statement)) {
				const moduleSpecifier = statement.moduleSpecifier
				if (ts.isStringLiteral(moduleSpecifier)) {
					deps.push(moduleSpecifier.text)
				}
			}

			// Extract classes
			if (ts.isClassDeclaration(statement) && statement.name) {
				const className = statement.name.text
				const classDesc = getJsDocComment(statement)

				/** @type {MemberInfo[]} */
				const rawFields = []
				/** @type {MemberInfo[]} */
				const rawMethods = []

				for (const member of statement.members) {
					const memberModifiers = member.modifiers || []
					const isStatic = memberModifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)
					const isAsync = memberModifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
					const memberDesc = getJsDocComment(member)

					if (ts.isPropertyDeclaration(member) && member.name) {
						const name = member.name.getText(sourceFile)
						const type = member.type ? member.type.getText(sourceFile) : undefined
						/** @type {Record<string, any> | undefined} */
						let schema = undefined

						// If JS file has static schema object literal initializer (e.g. static dir = { help: "..." })
						if (member.initializer && ts.isObjectLiteralExpression(member.initializer)) {
							schema = {}
							for (const prop of member.initializer.properties) {
								if (ts.isPropertyAssignment(prop) && prop.name && prop.initializer) {
									const pName = prop.name.getText(sourceFile)
									const pVal = prop.initializer.getText(sourceFile).replace(/^['"]|['"]$/g, '')
									schema[pName] = pVal
								}
							}
						}

						rawFields.push({
							name,
							type,
							isStatic,
							isAsync,
							description: memberDesc || undefined,
							schema,
						})
					} else if (ts.isMethodDeclaration(member) && member.name) {
						const name = member.name.getText(sourceFile)
						const returnType = member.type ? member.type.getText(sourceFile) : 'void'
						const parameters = member.parameters.map((p) => p.getText(sourceFile))
						rawMethods.push({
							name,
							returnType,
							parameters,
							isStatic,
							isAsync,
							description: memberDesc || undefined,
						})
					}
				}

				// Apply 'only' filter
				let filteredFields = rawFields
				let filteredMethods = rawMethods

				if (only === 'static') {
					filteredFields = filteredFields.filter((f) => f.isStatic)
					filteredMethods = filteredMethods.filter((m) => m.isStatic)
				} else if (only === 'async') {
					filteredFields = filteredFields.filter((f) => f.isAsync)
					filteredMethods = filteredMethods.filter((m) => m.isAsync)
				} else if (only === 'methods') {
					filteredFields = []
				} else if (only === 'fields') {
					filteredMethods = []
				}

				/** @type {ClassContract} */
				const classContract = {
					name: className,
					description: classDesc || undefined,
				}

				// Apply 'level' filter
				if (level === 'all') {
					classContract.fields = filteredFields
					classContract.methods = filteredMethods
				} else if (level === 'methods') {
					classContract.methods = filteredMethods
				} else if (level === 'fields') {
					classContract.fields = filteredFields
				}
				// if level === 'classes', we omit both fields and methods

				exports[className] = classContract
			}
		}

		/** @type {{ exports: Record<string, ClassContract>, deps?: string[] }} */
		const result = { exports }
		if (includeDeps) {
			result.deps = deps
		}
		return result
	}

	/**
	 * Reads file via injected DB and extracts API contract.
	 * @param {string} filePath
	 * @param {Object} [options]
	 * @returns {Promise<{ exports: Record<string, ClassContract>, deps?: string[] }>}
	 */
	async extractFromFile(filePath, options = {}) {
		if (!this.$db) {
			throw new Error('FastApiDiscovery: DB not injected')
		}
		const doc = await this.$db.loadDocument(filePath)
		const content = typeof doc === 'string' ? doc : doc?.$content || doc?.content || ''
		return this.extractFromSource(content, { ...options, fileName: filePath })
	}

	/**
	 * Formats extracted contract into structured dictionary for NaN0 serialization.
	 * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
	 * @param {Object} [options]
	 * @param {'short' | 'full'} [options.style]
	 * @returns {Record<string, any>}
	 */
	toContractObject(extracted, options = {}) {
		const style = options.style || 'short'
		/** @type {Record<string, any>} */
		const root = {}

		if (extracted.deps && extracted.deps.length > 0) {
			root.deps = extracted.deps
		}

		for (const [className, cls] of Object.entries(extracted.exports || {})) {
			/** @type {Record<string, any>} */
			const classObj = {}
			if (cls.description) {
				classObj.description = cls.description
			}

			if (cls.fields && cls.fields.length > 0) {
				/** @type {Record<string, any>} */
				const fieldsObj = {}
				for (const f of cls.fields) {
					const prefix = f.isStatic ? 'static ' : ''
					const key = `${prefix}${f.name}`
					if (style === 'short') {
						const desc = f.schema?.help || f.description || f.type || ''
						fieldsObj[key] = desc
					} else {
						fieldsObj[key] = {
							...(f.type ? { type: f.type } : {}),
							...(f.description ? { description: f.description } : {}),
							...(f.schema ? f.schema : {}),
						}
					}
				}
				classObj.fields = fieldsObj
			}

			if (cls.methods && cls.methods.length > 0) {
				/** @type {Record<string, any>} */
				const methodsObj = {}
				for (const m of cls.methods) {
					const hasParams = m.parameters && m.parameters.length > 0
					const sig = `${m.name}(${hasParams ? '...' : ''})`
					if (style === 'short') {
						methodsObj[sig] = m.description || ''
					} else {
						methodsObj[sig] = {
							...(m.description ? { description: m.description } : {}),
							...(hasParams ? { params: m.parameters } : {}),
							...(m.returnType ? { result: m.returnType } : {}),
						}
					}
				}
				classObj.methods = methodsObj
			}

			root[className] = classObj
		}

		return root
	}

	/**
	 * Formats extracted contract into concise Nano string via NaN0.stringify.
	 * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
	 * @param {Object} [options]
	 * @param {'short' | 'full'} [options.style]
	 * @returns {string}
	 */
	stringify(extracted, options = {}) {
		const contractObj = this.toContractObject(extracted, options)
		return NaN0.stringify(contractObj)
	}

	/**
	 * Backward compatibility helper for toNanoYaml.
	 * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
	 * @param {Object} [options]
	 * @returns {string}
	 */
	toNanoYaml(extracted, options = {}) {
		return this.stringify(extracted, options)
	}
}
