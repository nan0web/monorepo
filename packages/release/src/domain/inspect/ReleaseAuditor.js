import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { show, progress, result } from '@nan0web/ui'

/**
 * @typedef {Object} ReleaseDiagnostic
 * @property {'error' | 'warning' | 'info'} level
 * @property {string} code
 * @property {string} [check]
 * @property {string} [file]
 * @property {string} error
 * @property {string} [suggestion]
 * @property {string} [fix]
 */

/**
 * ReleaseAuditor — Architecture auditor and validator for PM-as-Code release structures.
 */
export class ReleaseAuditor extends AuditorModel {
	static alias = 'release'

	static changed = {
		help: 'Only inspect modified workspaces/releases',
		default: false,
		type: 'boolean',
		alias: 'c',
	}

	static all = {
		help: 'Audit all registered projects in releases.txt',
		default: false,
		type: 'boolean',
		alias: 'a',
	}

	static registryFile = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
		alias: 'f',
	}

	static UI = {
		title: 'PM-as-Code Release Structure Auditor',
		header: '🔍 Running Release Quality & Compliance Audit for {$dir}...',
		skipped: 'Release audit skipped (capped by active session)',
		missingPackageJson: 'Missing package.json in {$dir}',
		noReleasesDir: 'No release directories found under {$dir}',
		releasesFound: 'Discovered {$count} release(s) in {$dir}',
		releaseHeader: 'Auditing Release [v{$version}] at {$path}',
		releaseDocCompleted: 'Release document valid: {$file} ({$done}/{$total} tasks completed)',
		missingReleaseDoc: 'Missing release.md, task.md, or plan.md in {$path}',
		missingUserDoc: 'Missing user.md metrics document in {$path}',
		incompleteUserMetrics: 'user.md in {$path} is missing Hours, Iterations, or RRS score',
		userMetricsValid: 'user.md metrics valid (Hours: {$hours}h, Iterations: {$iterations}, RRS: {$rrs})',
		ambiguousContracts: 'Both task.spec.js (WIP) and task.test.js (Closed) exist simultaneously in {$path}',
		missingContract: 'Missing contract test in {$path} (task.spec.js or task.test.js required)',
		activeContractWip: 'Active contract present: task.spec.js [WIP]',
		sealedRegressionClosed: 'Sealed regression test present: task.test.js [CLOSED]',
		orphanFile: 'Orphan file found in releases/ root: {$file}',
		summary: 'Release Audit Complete: {$releases} release(s) checked | Status: {$status} | Errors: {$errors} | Warnings: {$warnings}',
		Diagnostics: {
			MISSING_PACKAGE_JSON: {
				level: 'error',
				code: 'MISSING_PACKAGE_JSON',
				message: 'Missing package.json in {$dir}',
				fix: 'Ensure package.json exists with valid name and version.',
			},
			MISSING_RELEASES_DIR: {
				level: 'error',
				code: 'MISSING_RELEASES_DIR',
				message: 'No release directories found under {$dir}',
				fix: 'Initialize release directory: pnpm exec release init v0.1.0',
			},
			MISSING_RELEASE_MD: {
				level: 'error',
				code: 'MISSING_RELEASE_MD',
				message: 'Missing release.md or task.md in {$path}',
				fix: 'Create {$path}/release.md with release scope, user stories, and acceptance checklist.',
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
				message: 'Both task.spec.js and task.test.js exist simultaneously in {$path}',
				fix: 'If release is still active, keep task.spec.js. If release is sealed/closed, keep task.test.js.',
			},
			MISSING_CONTRACT: {
				level: 'error',
				code: 'MISSING_CONTRACT',
				message: 'No contract test found in {$path} (missing task.spec.js or task.test.js)',
				fix: 'Create contract test {$path}/task.spec.js for TDD verification.',
			},
			ORPHAN_RELEASE_FILE: {
				level: 'warning',
				code: 'ORPHAN_RELEASE_FILE',
				message: 'Orphan file "{$file}" located directly in releases/ directory outside of version folders',
				fix: 'Move "{$file}" into the appropriate version directory (e.g. releases/vX.Y.Z/) or backlog.md.',
			},
			DEPRECATED_TEST_LOCATION: {
				level: 'warning',
				code: 'DEPRECATED_TEST_LOCATION',
				message: 'Closed regression test located in singular directory "{$file}". Canonical path is "src/tests/releases/".',
				fix: 'Migrate regression test from "src/test/releases/" to "src/tests/releases/".',
			},
			DIRTY_SRC_RELEASES: {
				level: 'error',
				code: 'DIRTY_SRC_RELEASES',
				message: 'Architectural violation: regression tests found in "{$file}". Polluting production src/ directory is forbidden.',
				fix: 'Move tests from "src/releases/" to canonical regression directory "src/tests/releases/".',
			},
			PROCEDURAL_RELEASE_ARTIFACT: {
				level: 'warning',
				code: 'PROCEDURAL_RELEASE_ARTIFACT',
				message: 'Procedural artifact "{$file}" found in release {$path}. Releases must be pure Data-Driven.',
				fix: 'Remove "{$file}". Use data-driven *.nan0 documents and multimodal runners (serve releases/) instead of ad-hoc HTML/JS.',
			},
		},
	}

	/**
	 * @param {Partial<ReleaseAuditor> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} */ this.changed = Boolean(data.changed || (options && 'changed' in options ? /** @type {any} */ (options).changed : false))
		/** @type {boolean} */ this.all = Boolean(data.all || (options && 'all' in options ? /** @type {any} */ (options).all : false))
		/** @type {string} */ this.registryFile = String(data.registryFile || 'releases.txt')
	}

	/**
	 * Runs the PM-as-Code release audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const db = this._.db
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t || ((key, params) => {
			let str = String(key || '')
			if (params) {
				for (const [k, v] of Object.entries(params)) {
					str = str.replaceAll(`{$${k}}`, String(v)).replaceAll(`{${k}}`, String(v))
				}
			}
			return str
		})

		if (await this.isCapped()) {
			yield progress(t(ReleaseAuditor.UI.skipped))
			return result({
				success: true,
				skipped: true,
				errors: [],
				warnings: [],
				checkedReleases: [],
			})
		}

		yield progress(t(ReleaseAuditor.UI.header, { dir: this.dir }))

		/** @type {ReleaseDiagnostic[]} */
		const errors = []
		/** @type {ReleaseDiagnostic[]} */
		const warnings = []
		const checkedReleases = []

		const projectRoot = this.dir === '.' || !this.dir ? '' : `${this.dir.replace(/\/+$/, '')}/`

		// 1. Check package.json if auditing specific directory
		if (projectRoot) {
			let hasPkg = await this.fileExists('package.json')
			if (!hasPkg) {
				// Also check common subdirectories in monorepo/3rdparty apps like cms/package.json
				for (const sub of ['cms/package.json', 'app/package.json', 'api/package.json', 'web/package.json']) {
					if (await this.fileExists(sub)) {
						hasPkg = true
						break
					}
				}
			}
			if (!hasPkg) {
				const diagDef = ReleaseAuditor.UI.Diagnostics.MISSING_PACKAGE_JSON
				const err = {
					level: /** @type {'error'} */ ('error'),
					code: diagDef.code,
					check: 'package.json',
					file: `${projectRoot}package.json`,
					error: t(diagDef.message, { dir: this.dir }),
					fix: t(diagDef.fix, { dir: this.dir }),
				}
				errors.push(err)
				yield show(err.error, 'error')
			}
		}

		// 2. Discover release directories
		const releaseDirs = await this.#discoverReleases(db, projectRoot)

		if (releaseDirs.length === 0) {
			const diagDef = ReleaseAuditor.UI.Diagnostics.MISSING_RELEASES_DIR
			const err = {
				level: /** @type {'error'} */ ('error'),
				code: diagDef.code,
				check: 'releases/',
				file: `${projectRoot}releases/`,
				error: t(diagDef.message, { dir: this.dir }),
				fix: t(diagDef.fix, { dir: this.dir }),
			}
			errors.push(err)
			yield show(err.error, 'error')
		} else {
			yield show(t(ReleaseAuditor.UI.releasesFound, { count: releaseDirs.length, dir: this.dir }), 'info')
		}

		// 3. Check each release directory
		for (const rel of releaseDirs) {
			const relPath = rel.path
			yield show(t(ReleaseAuditor.UI.releaseHeader, { version: rel.version, path: relPath }))

			// A. Check release.md / task.md / plan.md
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
				const diagDef = ReleaseAuditor.UI.Diagnostics.MISSING_RELEASE_MD
				const err = {
					level: /** @type {'error'} */ ('error'),
					code: diagDef.code,
					check: 'release.md',
					file: `${relPath}/release.md`,
					error: t(diagDef.message, { path: relPath }),
					fix: t(diagDef.fix, { path: relPath }),
				}
				errors.push(err)
				yield show(err.error, 'error')
			} else {
				const { done, total } = this.#countTasks(releaseContent)
				yield show(
					t(ReleaseAuditor.UI.releaseDocCompleted, {
						file: releaseDocFile.split('/').pop(),
						done,
						total,
					}),
					'success'
				)
			}

			// B. Check user.md metrics
			let userDoc = null
			try {
				userDoc = await db.loadDocument(`${relPath}/user.md`, null)
			} catch {}

			if (!userDoc) {
				const diagDef = ReleaseAuditor.UI.Diagnostics.MISSING_USER_MD
				const warn = {
					level: /** @type {'warning'} */ ('warning'),
					code: diagDef.code,
					check: 'user.md',
					file: `${relPath}/user.md`,
					error: t(diagDef.message, { path: relPath }),
					fix: t(diagDef.fix, { path: relPath }),
				}
				warnings.push(warn)
				yield show(warn.error, 'warn')
			} else {
				const userStr = typeof userDoc === 'object' ? JSON.stringify(userDoc) : String(userDoc)
				const hasHours =
					/витрачений час/i.test(userStr) ||
					/час роботи/i.test(userStr) ||
					/час розробки/i.test(userStr) ||
					/hours/i.test(userStr) ||
					/годин/i.test(userStr) ||
					/time/i.test(userStr) ||
					(userDoc && typeof userDoc === 'object' && (userDoc.hours !== undefined || userDoc.time !== undefined))
				const hasIters =
					/кількість ітерацій/i.test(userStr) ||
					/ітерацій/i.test(userStr) ||
					/iterations/i.test(userStr) ||
					/runs/i.test(userStr) ||
					(userDoc && typeof userDoc === 'object' && userDoc.iterations !== undefined)
				const hasRrs =
					/rrs/i.test(userStr) ||
					/score/i.test(userStr) ||
					/готовності/i.test(userStr) ||
					/бал/i.test(userStr) ||
					(userDoc && typeof userDoc === 'object' && userDoc.rrs !== undefined)

				if (!hasHours || !hasIters || !hasRrs) {
					const diagDef = ReleaseAuditor.UI.Diagnostics.INCOMPLETE_USER_METRICS
					const warn = {
						level: /** @type {'warning'} */ ('warning'),
						code: diagDef.code,
						check: 'user.md',
						file: `${relPath}/user.md`,
						error: t(diagDef.message, { path: relPath }),
						fix: t(diagDef.fix, { path: relPath }),
					}
					warnings.push(warn)
					yield show(warn.error, 'warn')
				} else {
					yield show(t(ReleaseAuditor.UI.userMetricsValid, { hours: 'ok', iterations: 'ok', rrs: 'ok' }), 'success')
				}
			}

			// C. Check contract tests (*.spec.js / *.test.js / *.story.js in releases/ or regression dirs)
			let hasSpec = false
			let hasTest = false
			let specFile = ''
			let testFile = ''

			// Check within release directory
			let relFiles = []
			try {
				if (typeof db.listDir === 'function') {
					relFiles = await db.listDir(relPath, { depth: 0 })
				}
			} catch {}

			if (Array.isArray(relFiles) && relFiles.length > 0) {
				for (const f of relFiles) {
					const name = f.name || (f.path || '').split('/').pop() || ''
					if (name.endsWith('.spec.js')) {
						hasSpec = true
						specFile = `${relPath}/${name}`
					} else if (name.endsWith('.test.js') || name.endsWith('.story.js')) {
						hasTest = true
						testFile = `${relPath}/${name}`
					}
				}
			} else {
				// Fallback to explicit file probing
				for (const candidate of ['task.spec.js']) {
					try {
						const doc = await db.loadDocument(`${relPath}/${candidate}`, null)
						if (doc) {
							hasSpec = true
							specFile = `${relPath}/${candidate}`
							break
						}
					} catch {}
				}
				for (const candidate of ['task.test.js', 'task.story.js']) {
					try {
						const doc = await db.loadDocument(`${relPath}/${candidate}`, null)
						if (doc) {
							hasTest = true
							testFile = `${relPath}/${candidate}`
							break
						}
					} catch {}
				}
			}

			// Check regression directories outside releases/ if not found inside release
			// Calculate relative subpath after releases/
			const relSubpath = relPath.startsWith(`${projectRoot}releases/`)
				? relPath.slice(`${projectRoot}releases/`.length)
				: relPath.replace(/^releases\//, '')

			// 1. Check canonical: src/tests/releases/ (🟢 OK / Sealed)
			let canonicalTestFile = null
			for (const ext of ['task.test.js', 'task.story.js', 'task.spec.js']) {
				const p = `${projectRoot}src/tests/releases/${relSubpath}/${ext}`
				try {
					const d = await db.loadDocument(p, null)
					if (d) {
						canonicalTestFile = p
						break
					}
				} catch {}
			}
			if (canonicalTestFile) {
				hasTest = true
				testFile = canonicalTestFile
			}

			// 2. Check singular: src/test/releases/ (⚠️ WARN: deprecated)
			let singularTestFile = null
			for (const ext of ['task.test.js', 'task.story.js', 'task.spec.js']) {
				const p = `${projectRoot}src/test/releases/${relSubpath}/${ext}`
				try {
					const d = await db.loadDocument(p, null)
					if (d) {
						singularTestFile = p
						break
					}
				} catch {}
			}
			if (singularTestFile) {
				hasTest = true
				if (!testFile) testFile = singularTestFile
				const diagDef = ReleaseAuditor.UI.Diagnostics.DEPRECATED_TEST_LOCATION
				const warn = {
					level: /** @type {'warning'} */ ('warning'),
					code: diagDef.code,
					check: 'src/test/releases/',
					file: singularTestFile,
					error: t(diagDef.message, { file: singularTestFile }),
					fix: t(diagDef.fix),
				}
				warnings.push(warn)
				yield show(warn.error, 'warn')
			}

			// 3. Check dirty src/releases/ (❌ ERROR: architectural violation)
			let dirtyTestFile = null
			for (const ext of ['task.test.js', 'task.story.js', 'task.spec.js']) {
				const p = `${projectRoot}src/releases/${relSubpath}/${ext}`
				try {
					const d = await db.loadDocument(p, null)
					if (d) {
						dirtyTestFile = p
						break
					}
				} catch {}
			}
			if (dirtyTestFile) {
				const diagDef = ReleaseAuditor.UI.Diagnostics.DIRTY_SRC_RELEASES
				const err = {
					level: /** @type {'error'} */ ('error'),
					code: diagDef.code,
					check: 'src/releases/',
					file: dirtyTestFile,
					error: t(diagDef.message, { file: dirtyTestFile }),
					fix: t(diagDef.fix),
				}
				errors.push(err)
				yield show(err.error, 'error')
			}

			if (hasSpec && hasTest) {
				const diagDef = ReleaseAuditor.UI.Diagnostics.AMBIGUOUS_CONTRACTS
				const err = {
					level: /** @type {'error'} */ ('error'),
					code: diagDef.code,
					check: specFile || 'task.spec.js',
					file: specFile || `${relPath}/task.spec.js`,
					error: t(diagDef.message, { path: relPath }),
					fix: t(diagDef.fix, { path: relPath }),
				}
				errors.push(err)
				yield show(err.error, 'error')
			} else if (!hasSpec && !hasTest && !dirtyTestFile) {
				const diagDef = ReleaseAuditor.UI.Diagnostics.MISSING_CONTRACT
				const err = {
					level: /** @type {'error'} */ ('error'),
					code: diagDef.code,
					check: 'task.spec.js',
					file: `${relPath}/task.spec.js`,
					error: t(diagDef.message, { path: relPath }),
					fix: t(diagDef.fix, { path: relPath }),
				}
				errors.push(err)
				yield show(err.error, 'error')
			} else if (hasSpec) {
				yield show(t(ReleaseAuditor.UI.activeContractWip), 'success')
			} else if (hasTest) {
				yield show(t(ReleaseAuditor.UI.sealedRegressionClosed), 'success')
			}

			// D. Check for prohibited procedural artifacts (index.html, play.js)
			for (const procName of ['index.html', 'play.js']) {
				try {
					const hasProc = await db.loadDocument(`${relPath}/${procName}`, null)
					if (hasProc) {
						const diagDef = ReleaseAuditor.UI.Diagnostics.PROCEDURAL_RELEASE_ARTIFACT
						const warn = {
							level: /** @type {'warning'} */ ('warning'),
							code: diagDef.code,
							check: procName,
							file: `${relPath}/${procName}`,
							error: t(diagDef.message, { file: procName, path: relPath }),
							fix: t(diagDef.fix, { file: procName, path: relPath }),
						}
						warnings.push(warn)
						yield show(warn.error, 'warn')
					}
				} catch {}
			}

			checkedReleases.push({
				version: rel.version,
				path: rel.path,
				valid: errors.filter((e) => e.file?.startsWith(relPath)).length === 0,
			})
		}

		// 4. Check for orphan files in releases/ root
		const orphanFiles = await this.#findOrphanReleaseFiles(db, projectRoot)
		for (const orphan of orphanFiles) {
			const diagDef = ReleaseAuditor.UI.Diagnostics.ORPHAN_RELEASE_FILE
			const warn = {
				level: /** @type {'warning'} */ ('warning'),
				code: diagDef.code,
				check: orphan,
				file: `${projectRoot}releases/${orphan}`,
				error: t(diagDef.message, { file: orphan }),
				fix: t(diagDef.fix, { file: orphan }),
			}
			warnings.push(warn)
			yield show(warn.error, 'warn')
		}

		const isSuccess = errors.length === 0
		yield show(
			t(ReleaseAuditor.UI.summary, {
				releases: checkedReleases.length,
				status: isSuccess ? 'PASSED' : 'FAILED',
				errors: errors.length,
				warnings: warnings.length,
			}),
			isSuccess ? 'success' : 'warn'
		)

		return result({
			success: isSuccess,
			errors,
			warnings,
			checkedReleases,
			diagnostics: [...errors, ...warnings],
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

export default ReleaseAuditor
