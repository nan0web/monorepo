import { show } from '@nan0web/ui'

import { DomainAuditor } from '../DomainAuditor.js'

export class JsDomainAuditor extends DomainAuditor {
	/**
	 * @param {string} dir
	 * @param {string[]} [collected]
	 * @returns {Promise<string[]>}
	 */
	async _collectJsFiles(dir, collected = []) {
		if (!this._.db) throw new Error('DB not found in context')
		try {
			for await (const entry of this._.db.readDir(dir, { depth: 0, includeDirs: true })) {
				if (entry.name.startsWith('.')) continue
				if (entry.name === 'node_modules') continue

				if (entry.isDirectory) {
					await this._collectJsFiles(entry.path, collected)
				} else if (entry.isFile) {
					if (
						entry.name.endsWith('.js') &&
						!entry.name.endsWith('.test.js') &&
						!entry.name.endsWith('.md.js') &&
						!entry.name.endsWith('.spec.js') &&
						!entry.name.endsWith('.story.js')
					) {
						collected.push(entry.path)
					}
				}
			}
		} catch {}
		return collected
	}

	/**
	 * @param {import('../DomainAuditor.js').DomainError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 */
	async *checkPlatformDomain(errors, t) {
		if (!this._.db) throw new Error('DB not found in context')
		const srcDir = this._.db.resolveSync(this.dir, 'src')
		const domainDir = this._.db.resolveSync(this.dir, 'src/domain')

		const hasSrc = await this._.db.statDocument(srcDir).catch(() => null)
		if (
			!hasSrc ||
			(hasSrc.isDirectory !== true &&
				typeof hasSrc.isDirectory !== 'function' &&
				hasSrc.size === undefined)
		) {
			return { domain: { violations: [] } }
		}

		const allFiles = await this._collectJsFiles(srcDir)

		for (const file of allFiles) {
			const normalizedFile = file.replace(/\\/g, '/')
			const isDomain =
				normalizedFile.includes('/src/domain/') ||
				normalizedFile.startsWith('src/domain/') ||
				normalizedFile.endsWith('/src/domain')

			const val = await this._.db.loadDocument(file).catch(() => '')
			const content = typeof val === 'string' ? val : val && val.toString ? val.toString() : ''
			const lines = content.split('\n')

			// Parse classes in file for Model-as-Schema validation
			const classRegex = /class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$.]+))?\s*\{/g
			let classMatch
			while ((classMatch = classRegex.exec(content)) !== null) {
				const className = classMatch[1]
				const extendsClause = classMatch[2] || ''
				const classStartIndex = classMatch.index

				// Find class matching closing brace or limit to class scope
				let depth = 0
				let classEndIndex = content.length
				for (let idx = content.indexOf('{', classStartIndex); idx < content.length; idx++) {
					if (content[idx] === '{') depth++
					else if (content[idx] === '}') {
						depth--
						if (depth === 0) {
							classEndIndex = idx
							break
						}
					}
				}

				const classBody = content.slice(classStartIndex, classEndIndex)

				// Only check classes that extend Model or are in domain
				const isModelClass = extendsClause.includes('Model') || className.endsWith('Model')

				if (isModelClass) {
					// Extract constructor body
					const ctorMatch = /constructor\s*\([^)]*\)\s*\{([\s\S]*?)(?:\n[\t ]*\})/.exec(classBody)
					const ctorBody = ctorMatch ? ctorMatch[1] : ''

					// Collect static field declarations
					// e.g. static field = ...
					const staticFieldRegex = /^\s*static\s+([a-zA-Z0-9_$]+)\s*=/gm
					let sfMatch
					while ((sfMatch = staticFieldRegex.exec(classBody)) !== null) {
						const fieldName = sfMatch[1]

						// Skip rules:
						// 1. Starts with $ ($alias, $collection, etc.)
						if (fieldName.startsWith('$')) continue
						// 2. Starts with uppercase letter (UI, SCHEMA, PascalCase SubModel, etc.)
						if (/^[A-Z]/.test(fieldName)) continue
						// 3. System alias 'alias'
						if (fieldName === 'alias') continue

						if (!ctorMatch) {
							const error = `Missing constructor in Model class '${className}' in ${file}`
							errors.push({
								file,
								field: fieldName,
								error,
								check: 'missing_constructor',
							})
							yield show(error, 'error')
							continue
						}

						// Check if declared in constructor with /** @type ... */ this.fieldName
						// Must match `/** @type ... */ this.fieldName` within constructor
						const hasCtorDecl = new RegExp(
							`/\\*\\*\\s*@type[\\s\\S]*?\\*/\\s*this\\.${fieldName}\\b`
						).test(ctorBody)

						if (!hasCtorDecl) {
							const error = `Missing constructor declaration or JSDoc @type for static schema field '${fieldName}' in ${file} (${className})`
							errors.push({
								file,
								field: fieldName,
								error,
								check: 'missing_constructor_field',
							})
							yield show(error, 'error')
						}

						// Anti-pattern check: manual assignment of schema field in constructor
						// (e.g. `this.field = data.field || ...`), which breaks/duplicates super(data, options) resolution
						const manualAssignmentRegex = new RegExp(
							`this\\.${fieldName}\\s*=\\s*(?:data\\.${fieldName}|Boolean\\(data\\.${fieldName}|String\\(data\\.${fieldName})`
						)
						if (manualAssignmentRegex.test(ctorBody)) {
							// Extract help from static field definition if available
							const staticDeclRegex = new RegExp(
								`static\\s+${fieldName}\\s*=\\s*(\\{[\\s\\S]*?\\n\\s*\\}|[^;\\n]+)`
							)
							const declMatch = staticDeclRegex.exec(classBody)
							let helpDesc = ''
							if (declMatch) {
								const helpMatch = /help\s*:\s*['"`]([^'"`]+)['"`]/.exec(declMatch[1])
								if (helpMatch && helpMatch[1]) {
									helpDesc = ` ${helpMatch[1]}`
								}
							}
							const warning = `Notice (Smell): redundant manual assignment 'this.${fieldName} = data.${fieldName}' in ${file} (${className}). Field is automatically initialized by super(data, options). Consider using '/** @type {...}${helpDesc} */ this.${fieldName}' unless specific preprocessing is required.`
							yield show(warning, 'warn')
						}
					}
				}
			}

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i]

				const isAppCommand =
					normalizedFile.includes('/src/app/') || normalizedFile.startsWith('src/app/')
				if (!isDomain && !isAppCommand && /extends\s+Model\b/.test(line)) {
					const error = t(DomainAuditor.UI.violation_found, { file })
					errors.push({ file, error, check: 'model_location' })
					yield show(error, 'error')
					break
				}

				if (isDomain) {
					if (/import\s+.*from\s+['"](node:fs|fs|node:fs\/promises)['"]/.test(line)) {
						const error = t(DomainAuditor.UI.raw_fs_found, { file, line: i + 1 })
						errors.push({ file, line: i + 1, error, check: 'raw_fs' })
						yield show(error, 'error')
					}
					if (
						/import\s+.*from\s+['"](node:path|path|node:path\/posix|node:path\/win32)['"]/.test(
							line
						)
					) {
						const error = t(DomainAuditor.UI.raw_path_found, { file, line: i + 1 })
						errors.push({ file, line: i + 1, error, check: 'raw_path' })
						yield show(error, 'error')
					}

					// Architectural smell: passing explicit file extensions to saveDocument / loadDocument
					const dbCallMatch =
						/(?:this\.\$db|\bdb)\.(saveDocument|loadDocument)\s*\(\s*([^,\)]+)/.exec(line)
					if (dbCallMatch) {
						const method = dbCallMatch[1]
						const targetArg = dbCallMatch[2].trim()
						if (
							/\.(nan0|yaml|yml|json)['"]\s*$/.test(targetArg) ||
							/['"][^'"]+\.(nan0|yaml|yml|json)['"]/.test(targetArg)
						) {
							const error = t(DomainAuditor.UI.explicit_extension_found, {
								method,
								path: targetArg,
								file,
								line: i + 1,
							})
							errors.push({ file, line: i + 1, error, check: 'explicit_db_extension' })
							yield show(error, 'warn')
						}
					}
				}

				if (/^\t[a-zA-Z_$][a-zA-Z0-9_$]* = /.test(line)) {
					const context = lines.slice(Math.max(0, i - 20), i).join('\n')
					if (/\bclass\b/.test(context) && !/\bconstructor\b/.test(context)) {
						const error = t(DomainAuditor.UI.class_field_found, { file, line: i + 1 })
						errors.push({ file, error, check: 'class_field' })
						yield show(error, 'error')
					}
				}

				// Performance smell: regex replace inside streaming loop / map
				if (
					/(\.map|\.forEach|\.filter)\s*\([^)]*=>[^)]*\.replace\s*\(\s*\/[^^]/i.test(line) ||
					/(\.map|\.forEach|\.filter)\s*\([^)]*=>[^)]*\.replace\s*\(\s*\/\^/i.test(line)
				) {
					const error = `Performance smell: RegExp replace inside loop/map in ${file}:${i + 1}. Use startsWith/slice instead.`
					errors.push({ file, error, check: 'regex_in_loop' })
					yield show(error, 'warn')
				}
			}
		}

		if (errors.length === 0) {
			yield show(t(DomainAuditor.UI.domain_ok, {}), 'success')
		}

		return {
			domain: { violations: [...errors] },
		}
	}
}
