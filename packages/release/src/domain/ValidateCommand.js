import { ModelAsApp, show, result, progress } from '@nan0web/ui'
import { NaN0 } from '@nan0web/types'
import { stringifyCSV } from '@nan0web/csv0'
import { RegistryModel } from './Registry/RegistryModel.js'
import { DashboardModel } from './Dashboard/DashboardModel.js'
import { PMaCParser } from './PMaCParser.js'
import { ReleaseAuditor } from './inspect/ReleaseAuditor.js'

/**
 * ValidateCommand - CLI Release Inspector & Multi-Format Validator.
 * Validates PMaC compliance, tasks, criteria, parity and outputs in text, json, nan0, or csv.
 */
export class ValidateCommand extends ModelAsApp {
	static alias = 'validate'

	static UI = {
		title: 'PM-as-Code Release Inspector & Multi-Format Validator',
		header: '🔍 Release Inspector & Validator (nan0release validate)',
		scanningCount: 'Scanning {count} project(s)...',
		projectHeader: '\n📦 Project: {name} ({path})',
		noReleases: '  ⚠️ No releases discovered in {path}',
		savedReport: '💾 Report saved to {path}',
		summary: '\n📊 Validation Summary: {projects} project(s) checked | {releases} release(s) | Status: {status}',
	}

	static target = {
		help: 'Target path, package name, or release directory to validate',
		default: '',
		type: 'string',
		positional: true,
	}

	static format = {
		help: 'Output format (text, json, nan0, csv)',
		default: 'text',
		options: ['text', 'json', 'nan0', 'csv'],
		type: 'string',
		alias: 'm',
	}

	static output = {
		help: 'Path to save output report file',
		default: '',
		type: 'string',
		alias: 'o',
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
	 * @param {Partial<ValidateCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.target = String(data.target || '')
		/** @type {'text' | 'json' | 'nan0' | 'csv'} */ this.format = data.format || 'text'
		/** @type {string} */ this.output = String(data.output || '')
		/** @type {string} */ this.registryFile = String(data.registryFile || 'releases.txt')
		/** @type {boolean} */ this.all = Boolean(data.all)
	}

	/**
	 * Execute release validation and format rendering
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { success: boolean, releases: any[], output: string }, any>}
	 */
	async *run() {
		const db = this.$db
		const t = this._.t

		const format = this.format || 'text'
		if (format === 'text') {
			yield show(t(ValidateCommand.UI.header))
		}

		// 1. Resolve targets
		const targets = await this.#resolveTargets(db)
		if (format === 'text') {
			yield progress(t(ValidateCommand.UI.scanningCount, { count: targets.length }))
		}

		const parser = new PMaCParser()
		const validatedReleases = []
		let allValid = true

		for (const target of targets) {
			const projectRoot = target.path === '.' ? '' : `${target.path.replace(/\/+$/, '')}/`
			if (format === 'text') {
				yield show(t(ValidateCommand.UI.projectHeader, { name: target.name, path: target.path }))
			}

			// Run ReleaseAuditor for project
			const auditor = new ReleaseAuditor({ dir: target.path }, { db })
			await auditor.init()
			const auditGen = auditor.run()
			let aStep = await auditGen.next()
			while (!aStep.done) {
				aStep = await auditGen.next()
			}
			const auditRes = aStep.value?.data || aStep.value
			if (auditRes && auditRes.success === false) {
				allValid = false
			}

			// Discover release dirs (support both nested and flat)
			const releaseDirs = await this.#discoverReleases(db, projectRoot)

			if (releaseDirs.length === 0 && format === 'text') {
				yield show(t(ValidateCommand.UI.noReleases, { path: target.path }), 'warn')
			}

			const projectDiagnostics = auditRes?.diagnostics || [
				...(auditRes?.errors || []),
				...(auditRes?.warnings || []),
			]

			for (const rel of releaseDirs) {
				const releaseData = await this.#loadAndParseRelease(db, rel, parser)
				releaseData.projectDiagnostics = projectDiagnostics
				const relErrors = (auditRes?.errors || []).filter(
					(e) => !e.file || e.file.startsWith(rel.path) || e.file === `${projectRoot}package.json`
				)
				const relWarnings = (auditRes?.warnings || []).filter(
					(e) => !e.file || e.file.startsWith(rel.path)
				)
				releaseData.errors = relErrors
				releaseData.warnings = relWarnings
				releaseData.valid = relErrors.length === 0
				if (!releaseData.valid) allValid = false

				validatedReleases.push(releaseData)
			}
		}

		if (format === 'text') {
			yield progress('')
		}

		// 2. Render output based on format
		let outputStr = ''
		switch (format) {
			case 'json':
				outputStr = this.#renderJson(allValid, validatedReleases)
				break
			case 'nan0':
				outputStr = this.#renderNan0(allValid, validatedReleases)
				break
			case 'csv':
				outputStr = this.#renderCsv(validatedReleases)
				break
			case 'text':
			default:
				outputStr = this.#renderText(validatedReleases)
				break
		}

		// 3. Save to file if --output specified
		if (this.output) {
			await db.saveDocument(this.output, outputStr)
			if (format === 'text') {
				yield show(t(ValidateCommand.UI.savedReport, { path: this.output }), 'success')
			}
		} else if (format !== 'text') {
			// For non-text stdout formats
			yield show(outputStr)
		} else {
			yield show(outputStr)
		}

		if (format === 'text') {
			yield show(
				t(ValidateCommand.UI.summary, {
					projects: targets.length,
					releases: validatedReleases.length,
					status: allValid ? 'PASSED ✅' : 'FAILED ❌',
				}),
				allValid ? 'success' : 'warn'
			)
		}

		return result({
			success: allValid,
			releases: validatedReleases,
			output: outputStr,
		})
	}

	async #resolveTargets(db) {
		const targetParam = (this.target || '').trim()

		// Direct release directory?
		if (targetParam && (targetParam.includes('releases/') || targetParam.endsWith('releases'))) {
			// Find nearest ancestor containing package.json or project directory
			let projPath = targetParam.split(/\/releases(\/|$)/)[0] || '.'
			if (!projPath) projPath = '.'
			return [{ path: projPath, name: projPath, version: '0.0.0', releasesSubpath: targetParam, isDirectReleases: true }]
		}

		const registry = new RegistryModel({ filePath: this.registryFile || 'releases.txt' }, { db })
		let registeredProjects = []
		try {
			registeredProjects = await registry.loadProjects()
		} catch {
			registeredProjects = []
		}

		if (this.all || (!targetParam && registeredProjects.length > 0)) {
			return registeredProjects
		}

		if (targetParam) {
			const matched = registeredProjects.find(
				(p) =>
					p.name === targetParam ||
					p.path === targetParam ||
					p.path === targetParam.replace(/\/+$/, '')
			)
			if (matched) return [matched]
			return [{ path: targetParam, name: targetParam, version: '0.0.0' }]
		}

		return [{ path: '.', name: 'current-project', version: '0.0.0' }]
	}

	async #discoverReleases(db, projectRoot) {
		const results = []
		// If target was directly releases/ or path contains releases
		let releasesUri = ''
		if (projectRoot.includes('releases/') || projectRoot.endsWith('releases')) {
			releasesUri = projectRoot.replace(/\/+$/, '')
		} else {
			releasesUri = `${projectRoot}releases`.replace(/^\/+/, '') || 'releases'
		}

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
							const version = `v${dirMatch[1]}`
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

	async #loadAndParseRelease(db, rel, parser) {
		let releaseContent = ''
		let docName = ''
		for (const candidate of ['release.md', 'task.md', 'plan.md']) {
			try {
				const doc = await db.loadDocument(`${rel.path}/${candidate}`, null)
				if (doc) {
					releaseContent = String(doc)
					docName = candidate
					break
				}
			} catch {}
		}

		let userContent = ''
		try {
			const u = await db.loadDocument(`${rel.path}/user.md`, null)
			if (u) userContent = typeof u === 'object' ? JSON.stringify(u) : String(u)
		} catch {}

		const userMetrics = DashboardModel.parseUserMetrics(userContent)

		let parsed = null
		if (releaseContent) {
			parsed = parser.parse(releaseContent)
		}

		return {
			version: rel.version,
			path: rel.path,
			doc: docName,
			title: parsed?.title || '',
			status: parsed?.status || 'todo',
			type: parsed?.type || 'minor',
			epic: parsed?.epic || '',
			sprint: parsed?.sprint || '',
			tracker: parsed?.tracker || '',
			team: parsed?.team || [],
			tasks: parsed?.tasks || [],
			criteria: parsed?.criteria || [],
			parity: parsed?.parity || [],
			issues: parsed?.issues || [],
			userMetrics,
		}
	}

	#renderText(releases) {
		const lines = []
		for (const rel of releases) {
			const statusBadge = rel.valid ? '✅ VALID' : '❌ INVALID'
			lines.push(`\n  Release [${rel.version}] ${statusBadge}`)
			lines.push(`  Path: ${rel.path}`)
			if (rel.title) lines.push(`  Title: ${rel.title}`)
			lines.push(`  Status: ${rel.status} | Type: ${rel.type}`)
			if (rel.userMetrics) {
				lines.push(
					`  Metrics: ${rel.userMetrics.hours}h | ${rel.userMetrics.iterations} iters | RRS: ${rel.userMetrics.rrs}`
				)
			}
			const doneTasks = rel.tasks.filter((t) => t.status === 'done').length
			lines.push(`  Tasks: ${doneTasks}/${rel.tasks.length} completed`)
			for (const task of rel.tasks) {
				const mark = task.status === 'done' ? '✔' : '○'
				lines.push(`    ${mark} [${task.id}] ${task.title}`)
			}
			if (rel.parity?.length > 0) {
				lines.push(`  Parity Check (${rel.parity.length} collections):`)
				for (const p of rel.parity) {
					const pMark = p.synced ? '✅' : '⚠️'
					lines.push(`    ${pMark} ${p.collection}: ${p.actual}/${p.expected} (${p.comment || ''})`)
				}
			}
			if (rel.errors?.length > 0) {
				lines.push(`  Errors / Recommendations (${rel.errors.length}):`)
				for (const err of rel.errors) {
					lines.push(`    ❌ [${err.code}] ${err.error || err.message}`)
					if (err.fix) lines.push(`       👉 Fix: ${err.fix}`)
				}
			}
			if (rel.warnings?.length > 0) {
				lines.push(`  Warnings (${rel.warnings.length}):`)
				for (const warn of rel.warnings) {
					lines.push(`    ⚠️ [${warn.code}] ${warn.error || warn.message}`)
					if (warn.fix) lines.push(`       👉 Fix: ${warn.fix}`)
				}
			}
		}
		return lines.join('\n')
	}

	#renderJson(allValid, releases) {
		return JSON.stringify(
			{
				success: allValid,
				timestamp: new Date().toISOString(),
				total: releases.length,
				releases,
			},
			null,
			2
		)
	}

	#renderNan0(allValid, releases) {
		const payload = {
			success: allValid,
			total: releases.length,
			releases: releases.map((rel) => ({
				version: rel.version,
				path: rel.path,
				status: rel.status,
				type: rel.type,
				title: rel.title,
				valid: rel.valid,
				tasks_total: rel.tasks.length,
				tasks_done: rel.tasks.filter((t) => t.status === 'done').length,
			})),
		}
		return `# nan0 release validation report\n${NaN0.stringify(payload)}`
	}

	#renderCsv(releases) {
		const rows = []
		for (const rel of releases) {
			for (const task of rel.tasks) {
				rows.push({
					Version: rel.version,
					'Task ID': task.id,
					Title: task.title || '',
					Status: task.status || 'todo',
					Notes: task.notes || '',
				})
			}
		}
		return stringifyCSV(rows)
	}
}

export default ValidateCommand
