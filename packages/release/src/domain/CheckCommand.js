import { ModelAsApp, show, result, progress } from '@nan0web/ui'
import { RegistryModel } from './Registry/RegistryModel.js'
import { DashboardModel } from './Dashboard/DashboardModel.js'

/**
 * @typedef {Object} DiagnosticItem
 * @property {'error' | 'warning' | 'info'} level
 * @property {string} code
 * @property {string} project
 * @property {string} message
 * @property {string} file
 * @property {string} fix
 */

/**
 * CheckCommand - PM-as-Code Release Structure & Compliance Validator.
 */
export class CheckCommand extends ModelAsApp {
	static alias = 'check'

	static UI = {
		errorDbRequired: 'Database instance ({ db }) is required to execute CheckCommand',
		title: 'PM-as-Code Structure & Compliance Validator',
		header: '🔍 PM-as-Code Release Structure Validator (nan0release check)',
		scanningCount: 'Scanning {$count} project(s)...',
		projectHeader: '\n📦 Project: {$name} ({$path})',
		missingPackageJson: '  ❌ Missing package.json',
		packageJsonValid: '  ✅ package.json (v{$version})',
		noReleasesDir: '  ❌ No release directories found in {$path}',
		releasesDirFound: '  ✅ releases/ directory located ({$count} release(s) found)',
		releaseHeader: '    📂 Release [v{$version}] at {$path}:',
		releaseDocCompleted: '      ✅ {$file} ({$done}/{$total} tasks completed)',
		missingReleaseDoc: '      ❌ Missing release.md or task.md',
		missingUserDoc: '      ⚠️ Missing user.md metrics document',
		incompleteUserMetrics:
			'      ⚠️ user.md present but metrics are incomplete (Hours: 0h, RRS: 0)',
		userMetricsValid: '      ✅ user.md (Hours: {$hours}h, Iterations: {$iterations}, RRS: {$rrs})',
		ambiguousContracts: '      ❌ Both task.spec.js and task.test.js exist simultaneously',
		missingContract: '      ❌ Missing contract test (task.spec.js or task.test.js)',
		activeContractWip: '      ✅ Active contract: task.spec.js [WIP]',
		sealedRegressionClosed: '      ✅ Sealed regression: task.test.js [CLOSED]',
		orphanFile: '    ⚠️ Orphan file in releases/: {$file}',
		recommendationsHeader: '\n📋 Actionable Recommendations & Agent Instructions ({$count}):',
		recommendationItem:
			'\n[{$idx}] {$badge} [{$code}] {$message}\n    File: {$file}\n    👉 Fix Instruction (Human / AI Agent):\n       {$fix}',
		summary:
			'\n📊 Summary: {$projects} project(s) checked | Passed: {$passed} | Errors: {$errors} | Warnings: {$warnings}',
		Diagnostics: {
			MISSING_PACKAGE_JSON: {
				level: 'error',
				code: 'MISSING_PACKAGE_JSON',
				message: 'Missing package.json in {$path}',
				fix: 'Ensure {$projectRoot}package.json exists with valid "name" and "version" fields.',
			},
			MISSING_RELEASES_DIR: {
				level: 'error',
				code: 'MISSING_RELEASES_DIR',
				message: 'No release directories found under {$path}',
				fix: 'Initialize release directory: `pnpm exec release init v{$version}`',
			},
			MISSING_RELEASE_MD: {
				level: 'error',
				code: 'MISSING_RELEASE_MD',
				message: 'Missing release.md or task.md in {$path}',
				fix: 'Create {$path}/release.md with release notes, tasks checklist, and acceptance criteria.',
			},
			MISSING_USER_MD: {
				level: 'warning',
				code: 'MISSING_USER_MD',
				message: 'Missing user.md metrics document in {$path}',
				fix: 'Create {$path}/user.md containing Execution Metrics (Hours, Iterations, and RRS score).',
			},
			INCOMPLETE_USER_METRICS: {
				level: 'warning',
				code: 'INCOMPLETE_USER_METRICS',
				message: 'user.md in {$path} is missing hours, iterations or RRS score',
				fix: 'Update {$path}/user.md with sections: "Витрачений час розробки (Годин):", "Кількість ітерацій:", "Фінальний бал RRS:".',
			},
			AMBIGUOUS_CONTRACTS: {
				level: 'error',
				code: 'AMBIGUOUS_CONTRACTS',
				message:
					'Both task.spec.js (WIP) and task.test.js (Closed) exist simultaneously in {$path}',
				fix: 'If release is still in progress, delete task.test.js. If closed, delete task.spec.js.',
			},
			MISSING_CONTRACT: {
				level: 'error',
				code: 'MISSING_CONTRACT',
				message: 'No contract test found in {$path} (missing task.spec.js or task.test.js)',
				fix: 'Create contract test {$path}/task.spec.js for active development, or rename to task.test.js upon release sealing.',
			},
			ORPHAN_RELEASE_FILE: {
				level: 'warning',
				code: 'ORPHAN_RELEASE_FILE',
				message:
					'Orphan file "{$file}" located directly in releases/ directory outside of version folders',
				fix: 'Move "{$file}" into the appropriate version directory (e.g. releases/vX.Y.Z/) or remove it.',
			},
		},
	}

	static target = {
		help: 'Project path, package name, or "." to validate',
		default: '',
		type: 'string',
		positional: true,
	}

	static registryFile = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
		alias: 'f',
	}

	static all = {
		help: 'Validate all projects registered in releases.txt',
		default: false,
		type: 'boolean',
		alias: 'a',
	}

	/**
	 * @param {Partial<CheckCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.target
		/** @type {string} */ this.registryFile
		/** @type {boolean} */ this.all
	}

	/**
	 * Execute release structure check
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { success: boolean, diagnostics: DiagnosticItem[], checkedProjects: any[] }, any>}
	 */
	async *run() {
		const rawT = this._.t
		const db = this._.db
		const t = (template, params = {}) => {
			let str = (rawT ? rawT(template, params) : template) || template || ''
			if (params && typeof params === 'object') {
				for (const [k, v] of Object.entries(params)) {
					str = str.replaceAll(`{$${k}}`, String(v)).replaceAll(`{${k}}`, String(v))
				}
			}
			return str
		}
		if (!db) {
			throw new Error(t(CheckCommand.UI.errorDbRequired))
		}

		yield show(t(CheckCommand.UI.header))

		// 1. Resolve list of projects to check
		const registry = new RegistryModel({ filePath: this.registryFile || 'releases.txt' }, { db })
		let registeredProjects = []
		try {
			registeredProjects = await registry.loadProjects()
		} catch {
			registeredProjects = []
		}

		let targetsToCheck = []
		const targetParam = (this.target || '').trim()

		if (
			this.all ||
			targetParam === '--all' ||
			targetParam === '-a' ||
			(!targetParam && registeredProjects.length > 0)
		) {
			targetsToCheck = registeredProjects
		} else if (targetParam) {
			const targetNum = parseInt(targetParam, 10)
			if (!isNaN(targetNum) && targetNum >= 1 && targetNum <= registeredProjects.length) {
				targetsToCheck = [registeredProjects[targetNum - 1]]
			} else {
				const matched = registeredProjects.find(
					(p) =>
						p.name === targetParam ||
						p.path === targetParam ||
						p.path === targetParam.replace(/\/+$/, '')
				)
				if (matched) {
					targetsToCheck = [matched]
				} else {
					targetsToCheck = [{ path: targetParam, name: targetParam, version: '0.0.0' }]
				}
			}
		} else {
			targetsToCheck = [{ path: '.', name: 'current-project', version: '0.0.0' }]
		}

		yield progress(t(CheckCommand.UI.scanningCount, { count: targetsToCheck.length }))

		/** @type {DiagnosticItem[]} */
		const diagnostics = []
		const checkedProjects = []

		for (const proj of targetsToCheck) {
			const projectRoot = proj.path === '.' ? '' : `${proj.path.replace(/\/+$/, '')}/`

			yield show(t(CheckCommand.UI.projectHeader, { name: proj.name, path: proj.path }))

			// A. Validate package.json via db
			let pkg = null
			try {
				pkg = await db.loadDocument(`${projectRoot}package.json`, null)
			} catch {}

			if (!pkg) {
				const diagDef = CheckCommand.UI.Diagnostics.MISSING_PACKAGE_JSON
				diagnostics.push({
					level: diagDef.level,
					code: diagDef.code,
					project: proj.name,
					file: `${projectRoot}package.json`,
					message: t(diagDef.message, { path: proj.path }),
					fix: t(diagDef.fix, { projectRoot }),
				})
				yield show(t(CheckCommand.UI.missingPackageJson), 'error')
			} else {
				yield show(
					t(CheckCommand.UI.packageJsonValid, { version: pkg.version || '0.0.0' }),
					'success'
				)
			}

			// B. Discover release directories via db
			const releaseDirs = await this.#discoverReleases(db, projectRoot)

			if (releaseDirs.length === 0) {
				const diagDef = CheckCommand.UI.Diagnostics.MISSING_RELEASES_DIR
				diagnostics.push({
					level: diagDef.level,
					code: diagDef.code,
					project: proj.name,
					file: `${projectRoot}releases/`,
					message: t(diagDef.message, { path: `${projectRoot}releases/` }),
					fix: t(diagDef.fix, { version: pkg?.version || '0.1.0' }),
				})
				yield show(
					t(CheckCommand.UI.noReleasesDir, { path: `${projectRoot}releases/` }),
					'error'
				)
				checkedProjects.push({ name: proj.name, path: proj.path, valid: false })
				continue
			}

			yield show(
				t(CheckCommand.UI.releasesDirFound, { count: releaseDirs.length }),
				'success'
			)

			// C. Check each release directory
			for (const rel of releaseDirs) {
				const relPath = rel.path
				yield show(t(CheckCommand.UI.releaseHeader, { version: rel.version, path: relPath }))

				// 1. Check release.md / task.md
				let releaseContent = null
				let releaseDocFile = ''
				for (const docFile of ['release.md', 'task.md', 'plan.md']) {
					try {
						const doc = await db.loadDocument(`${relPath}/${docFile}`, null)
						if (doc) {
							releaseContent = String(doc)
							releaseDocFile = `${relPath}/${docFile}`
							break
						}
					} catch {}
				}

				if (!releaseContent) {
					const diagDef = CheckCommand.UI.Diagnostics.MISSING_RELEASE_MD
					diagnostics.push({
						level: diagDef.level,
						code: diagDef.code,
						project: proj.name,
						file: `${relPath}/release.md`,
						message: t(diagDef.message, { path: relPath }),
						fix: t(diagDef.fix, { path: relPath }),
					})
					yield show(t(CheckCommand.UI.missingReleaseDoc), 'error')
				} else {
					const tasks = this.#countTasks(releaseContent)
					yield show(
						t(CheckCommand.UI.releaseDocCompleted, {
							file: releaseDocFile.split('/').pop(),
							done: tasks.done,
							total: tasks.total,
						}),
						'success'
					)
				}

				// 2. Check user.md
				let userContent = null
				try {
					const u = await db.loadDocument(`${relPath}/user.md`, null)
					if (u) userContent = String(u)
				} catch {}

				if (!userContent) {
					const diagDef = CheckCommand.UI.Diagnostics.MISSING_USER_MD
					diagnostics.push({
						level: diagDef.level,
						code: diagDef.code,
						project: proj.name,
						file: `${relPath}/user.md`,
						message: t(diagDef.message, { path: relPath }),
						fix: t(diagDef.fix, { path: relPath }),
					})
					yield show(t(CheckCommand.UI.missingUserDoc), 'warn')
				} else {
					const metrics = DashboardModel.parseUserMetrics(userContent)
					if (metrics.hours === 0 && metrics.rrs === 0) {
						const diagDef = CheckCommand.UI.Diagnostics.INCOMPLETE_USER_METRICS
						diagnostics.push({
							level: diagDef.level,
							code: diagDef.code,
							project: proj.name,
							file: `${relPath}/user.md`,
							message: t(diagDef.message, { path: relPath }),
							fix: t(diagDef.fix, { path: relPath }),
						})
						yield show(t(CheckCommand.UI.incompleteUserMetrics), 'warn')
					} else {
						yield show(
							t(CheckCommand.UI.userMetricsValid, {
								hours: metrics.hours,
								iterations: metrics.iterations,
								rrs: metrics.rrs,
							}),
							'success'
						)
					}
				}

				// 3. Check contract tests (task.spec.js / task.test.js)
				let hasSpec = false
				let hasTest = false
				try {
					hasSpec = (await db.loadDocument(`${relPath}/task.spec.js`, null)) !== null
				} catch {}
				try {
					hasTest = (await db.loadDocument(`${relPath}/task.test.js`, null)) !== null
				} catch {}

				if (hasSpec && hasTest) {
					const diagDef = CheckCommand.UI.Diagnostics.AMBIGUOUS_CONTRACTS
					diagnostics.push({
						level: diagDef.level,
						code: diagDef.code,
						project: proj.name,
						file: relPath,
						message: t(diagDef.message, { path: relPath }),
						fix: t(diagDef.fix),
					})
					yield show(t(CheckCommand.UI.ambiguousContracts), 'error')
				} else if (!hasSpec && !hasTest) {
					const diagDef = CheckCommand.UI.Diagnostics.MISSING_CONTRACT
					diagnostics.push({
						level: diagDef.level,
						code: diagDef.code,
						project: proj.name,
						file: `${relPath}/task.spec.js`,
						message: t(diagDef.message, { path: relPath }),
						fix: t(diagDef.fix, { path: relPath }),
					})
					yield show(t(CheckCommand.UI.missingContract), 'error')
				} else if (hasSpec) {
					yield show(t(CheckCommand.UI.activeContractWip), 'success')
				} else if (hasTest) {
					yield show(t(CheckCommand.UI.sealedRegressionClosed), 'success')
				}
			}

			// D. Check for orphan files inside releases/ via db
			const orphanFiles = await this.#findOrphanReleaseFiles(db, projectRoot)
			if (orphanFiles.length > 0) {
				const diagDef = CheckCommand.UI.Diagnostics.ORPHAN_RELEASE_FILE
				for (const orphan of orphanFiles) {
					diagnostics.push({
						level: diagDef.level,
						code: diagDef.code,
						project: proj.name,
						file: `${projectRoot}releases/${orphan}`,
						message: t(diagDef.message, { file: orphan }),
						fix: t(diagDef.fix, { file: orphan }),
					})
					yield show(t(CheckCommand.UI.orphanFile, { file: orphan }), 'warn')
				}
			}

			checkedProjects.push({
				name: proj.name,
				path: proj.path,
				releases: releaseDirs.map((r) => r.version),
			})
		}

		// Clear active progress spinner before rendering diagnostic summary
		yield progress('')

		// 3. Print Actionable Diagnostic Fix Summary
		if (diagnostics.length > 0) {
			yield show(t(CheckCommand.UI.recommendationsHeader, { count: diagnostics.length }))
			let idx = 1
			for (const diag of diagnostics) {
				const badge = diag.level === 'error' ? '❌ ERROR' : '⚠️ WARN'
				yield show(
					t(CheckCommand.UI.recommendationItem, {
						idx: idx++,
						badge,
						code: diag.code,
						message: diag.message,
						file: diag.file,
						fix: diag.fix,
					})
				)
			}
		}

		const errorCount = diagnostics.filter((d) => d.level === 'error').length
		const warnCount = diagnostics.filter((d) => d.level === 'warning').length
		const isSuccess = errorCount === 0

		yield show(
			t(CheckCommand.UI.summary, {
				projects: checkedProjects.length,
				passed: isSuccess ? 'YES' : 'NO',
				errors: errorCount,
				warnings: warnCount,
			}),
			isSuccess ? 'success' : 'warn'
		)

		return result({
			success: isSuccess,
			diagnostics,
			checkedProjects,
		})
	}

	/**
	 * Count tasks in markdown content
	 * @param {string} content
	 * @returns {{ done: number, total: number }}
	 */
	#countTasks(content = '') {
		let total = 0
		let done = 0
		for (const line of content.split('\n')) {
			const m = line.match(/^[-*+]?\s*(?:\[([ xX])\]|\d+\.\s*\[([ xX])\])\s*(.+)$/)
			if (m) {
				total++
				if ((m[1] || m[2] || '').toLowerCase() === 'x') done++
			}
		}
		return { done, total }
	}

	/**
	 * Discover release version directories using database
	 * @param {any} db
	 * @param {string} projectRoot
	 * @returns {Promise<Array<{ version: string, path: string }>>}
	 */
	async #discoverReleases(db, projectRoot) {
		const results = []
		const releasesUri = `${projectRoot}releases`.replace(/^\/+/, '') || 'releases'

		try {
			if (typeof db.listDir === 'function') {
				const queue = [{ uri: releasesUri, depth: 0 }]
				while (queue.length > 0) {
					const item = queue.shift()
					if (!item || item.depth > 3) continue
					let entries = []
					try {
						entries = await db.listDir(item.uri)
					} catch {
						continue
					}
					if (!Array.isArray(entries)) continue

					for (const entry of entries) {
						const rawName = entry.name || (entry.path || '').split('/').pop() || ''
						const name = rawName.replace(/\/$/, '')
						const isDir = Boolean(
							entry.stat?.isDirectory ||
							entry.isDirectory ||
							entry.isDir ||
							rawName.endsWith('/')
						)

						const dirMatch = name.match(/^v(\d+\.\d+\.\d+[a-zA-Z0-9._-]*)/)
						if (dirMatch) {
							const version = dirMatch[1]
							const entryPath = entry.path ? entry.path.replace(/\/$/, '') : `${item.uri}/${name}`
							const normalizedPath = entryPath.replace(/^\.\//, '')
							if (!results.find((r) => r.path === normalizedPath)) {
								results.push({ version, path: normalizedPath })
							}
						} else if (isDir && !name.startsWith('.') && name !== 'node_modules' && name !== '_') {
							const nextUri = entry.path ? entry.path.replace(/\/$/, '') : `${item.uri}/${name}`
							queue.push({ uri: nextUri, depth: item.depth + 1 })
						}
					}
				}
			}
		} catch {}

		return results
	}

	/**
	 * Find orphan files inside releases/ directory using db
	 * @param {any} db
	 * @param {string} projectRoot
	 * @returns {Promise<string[]>}
	 */
	async #findOrphanReleaseFiles(db, projectRoot) {
		const orphans = []
		const releasesUri = `${projectRoot}releases`.replace(/^\/+/, '') || 'releases'

		try {
			if (typeof db.listDir === 'function') {
				const entries = await db.listDir(releasesUri, { depth: 0 })
				for (const entry of entries) {
					const isFile = !entry.isDirectory && (entry.isFile || !entry.isDir)
					const name = entry.name || (entry.path || '').split('/').pop() || ''
					if (
						isFile &&
						!['index.js', 'current.js', 'README.md', 'backlog.md'].includes(name) &&
						!name.startsWith('.')
					) {
						orphans.push(name)
					}
				}
			}
		} catch {}

		return orphans
	}
}

export default CheckCommand
