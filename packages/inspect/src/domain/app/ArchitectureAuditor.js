import path from 'node:path'
import { show, progress, result, render, log } from '@nan0web/ui'
import { SnapshotAuditor } from '@nan0web/ui/inspect'

import { AuditorModel } from '../AuditorModel.js'
import { PhaseAuditor } from './PhaseAuditor.js'
import { HygieneAuditor } from './HygieneAuditor.js'
import { ExportAuditor } from './ExportAuditor.js'
import { DomainAuditor } from './DomainAuditor.js'
import { VerificationAuditor } from './VerificationAuditor.js'
import { CircularDependencyAuditor } from './CircularDependencyAuditor.js'
import { JsAuditorDiscovery } from './js/JsAuditorDiscovery.js'

/**
 * ArchitectureAuditor — Orchestrates the full architectural audit pipeline.
 */
class ArchitectureAuditor extends AuditorModel {
	static alias = 'audit'
	static UI = {
		title: '🏗️ Architecture Auditor',
		description: 'Full Inspector Pipeline — analyzes package architecture for compliance.',
		icon: '🏗️',
		db_unavailable: 'DB not available',
		error_audit: 'Audit {name} failed',
		error_auditor_class_alias: 'Auditor class [{name}] has no alias',
		error_external_auditors: 'Error with the external auditor while importing',
		ok: 'OK',
		fail: 'FAIL',
		crashed: 'Crashed',
		done: 'Done',
		issues_found: 'Issues found',
		starting: 'Starting Architecture Audit in {dir}...',
		scan_failed: 'Audit scan failed: {error}',
		writing_report: 'Writing healing report to next.md...',
		report_written: 'Healing report written to next.md — run recommended subagents',
		report_title: '# Architecture Healing Report',
		report_intro: 'The following architectural issues were detected in @[{dir}].',
		report_issues_title: '## Detected Violations',
		report_subagents_title: '## Recommended Subagents',
		report_failed: 'Failed to save report to next.md',
	}

	static skip = {
		help: 'Auditors to skip from all (comma-separated names or aliases)',
		type: 'string',
		default: 'provendocs',
	}

	static command = {
		help: 'Audit architecture of a project',
		options: [
			PhaseAuditor,
			HygieneAuditor,
			ExportAuditor,
			DomainAuditor,
			VerificationAuditor,
			CircularDependencyAuditor,
			SnapshotAuditor,
		],
		default: null,
	}

	static timeout = {
		help: 'Timeout for the audit operations in ms',
		default: 30_000
	}

	/**
	 * @param {Partial<ArchitectureAuditor>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Auditors to skip */ this.skip = data.skip || ArchitectureAuditor.skip.default
		/** @type {typeof AuditorModel | null} Current command */ this.command
		/** @type {number} Timeout for audit */ this.timeout
	}

	/**
	 * @param {string | typeof AuditorModel} key
	 * @param {import('../AuditorModel.js').LanguagePlatform} [platform='js']
	 * @returns {Promise<typeof AuditorModel | undefined>}
	 */
	static async getAuditorClass(key, platform = 'js') {
		let OriginalClass = undefined
		if ('string' !== typeof key && key.prototype instanceof AuditorModel) {
			OriginalClass = key
			key = String(key.alias)
		}
		key = String(key)
		const prefix = platform === 'js' ? 'Js' : 'Py'
		const name = key === 'exports' ? 'Export' : key.charAt(0).toUpperCase() + key.slice(1)
		const path = `./${platform}/${prefix}${name}Auditor.js`

		try {
			const mod = await import(path)
			const className = `${prefix}${name}Auditor`
			return mod[className] || OriginalClass
		} catch {
			return OriginalClass
		}
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) {
			throw new Error(ArchitectureAuditor.UI.db_unavailable)
		}

		const dir = this.dir
		await this.init()

		yield progress(t(ArchitectureAuditor.UI.starting, { dir }))

		const scores = {}
		let overallSuccess = true

		const discovery = new JsAuditorDiscovery({ dir }, this._)
		let externalAuditors = new Set()
		try {
			externalAuditors = await discovery.discover(dir)
		} catch (/** @type {any} */ err) {
			yield show(t(ArchitectureAuditor.UI.error_external_auditors), 'error')
			yield log('debug', String(err))
		}
		const allAuditors = new Set([
			...(ArchitectureAuditor.command.options || []),
			...externalAuditors,
		])

		const skipAliases = (this.skip || '')
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean)

		/**
		 * @typedef {Object} AuditorConfig
		 * @property {string} key Auditor alias or name.
		 * @property {string} title Auditor UI title.
		 * @property {typeof AuditorModel} Class Auditor class.
		 * @property {string} subDir Sub-directory of the auditor package.
		 */
		/**
		 * @type {AuditorConfig[]}
		 */
		const auditorsConfig = []
		for (const AuditorClass of allAuditors) {
			/** @type {string} */
			const key = String(AuditorClass.alias ?? '')
			if (!key) {
				yield show(
					t(ArchitectureAuditor.UI.error_auditor_class_alias, { name: AuditorClass.name }),
					'warn',
				)
				continue
			}
			if (key === 'provendocs' || key === 'audit' || skipAliases.includes(key.toLowerCase()))
				continue

			let subDir = dir
			let ActualClass = await ArchitectureAuditor.getAuditorClass(AuditorClass, this.platform)
			if (!ActualClass) continue
			auditorsConfig.push({
				key,
				title: ActualClass?.['UI']?.['title'] || ActualClass?.name,
				Class: ActualClass,
				subDir,
			})
		}

		// Sequential execution for maximum stability and clean output
		for (const config of auditorsConfig) {
			const { _, ...data } = this
			const auditor = new config.Class({ ...data, dir: config.subDir }, _)
			const gen = auditor.run()
			try {
				let lastStep = null
				let resValue = null

				let lastProgress = null
				while (true) {
					// Add a safety timeout for each step of the auditor
					const stepPromise = gen.next()
					const timeoutPromise = new Promise((_, reject) =>
						setTimeout(() => reject(new Error(`Auditor ${config.key} timed out`)), this.timeout),
					)

					const { done, value } = await Promise.race([stepPromise, timeoutPromise])

					if (done) {
						resValue = value
						break
					}
					lastStep = value
					if (value?.type === 'progress') {
						const title = `[${config.key}] ${String(value.props?.title || '').replace(/\.+$/, '')}`
						if (title === lastProgress) continue
						lastProgress = title
						if (value.props) value.props.title = title
					}
					yield value
				}

				const data = resValue?.data || resValue || { success: true }
				scores[config.key] = data
				if (data.success === false) overallSuccess = false

				// Ensure progress is cleared after each auditor
				if (lastStep?.type === 'progress') {
					yield progress('')
				}
			} catch (e) {
				const error = e instanceof Error ? e : new Error(String(e))
				yield render('Alert', {
					title: t(ArchitectureAuditor.UI.error_audit, { name: config.key }),
					children: error.message,
					variant: 'error',
				})
				scores[config.key] = { success: false, crashed: true, error: error.message }
				overallSuccess = false
				yield progress('')
			}
		}

		// Build Summary Table
		const totalCount = Object.keys(scores).length
		const passedCount = Object.values(scores).filter((s) => s.success).length
		const pct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100

		const allErrors = Object.entries(scores).flatMap(([key, s]) =>
			(Array.isArray(s.errors) ? s.errors : []).map((e) => ({ auditor: key, ...e })),
		)

		if (!overallSuccess) {
			yield progress(t(ArchitectureAuditor.UI.writing_report))
			const failedAuditors = Object.entries(scores)
				.filter(([_, s]) => !s.success)
				.map(([key]) => key)
			const healCmds = failedAuditors.map((key) => `nan0inspect ${key} --fix`)

			// Smart Merge for next.md
			let existingMdRaw = (await db.loadDocument('next.md').catch(() => '')) || ''
			const existingMd =
				typeof existingMdRaw === 'string'
					? existingMdRaw
					: existingMdRaw.content || String(existingMdRaw)

			let finalMd = existingMd.trim()
			if (!finalMd) {
				finalMd = `${t(ArchitectureAuditor.UI.report_title)}\n\n`
				const date = new Date().toLocaleString()
				finalMd += `> **Audit Date**: ${date}\n`
				finalMd += `> **Health Score**: ${pct}%\n\n`
				finalMd += `${t(ArchitectureAuditor.UI.report_intro, { dir: this.dir || '.' })}\n\n`
			}

			// Group errors by auditor
			const errorsByAuditor = {}
			for (const err of allErrors) {
				const auditorKey = err.auditor || 'unknown'
				if (!errorsByAuditor[auditorKey]) errorsByAuditor[auditorKey] = []
				errorsByAuditor[auditorKey].push(err)
			}

			for (const [auditorKey, auditorErrors] of Object.entries(errorsByAuditor)) {
				const config = auditorsConfig.find((c) => c.key === auditorKey)
				const auditorTitle = config?.title || auditorKey
				const auditorHeader = `### ${auditorTitle}`

				if (!finalMd.includes(auditorHeader)) {
					finalMd += `\n---\n\n${auditorHeader}\n`
				}

				// Group by boundary + context to avoid redundancy
				const groupedByContext = {}
				for (const err of auditorErrors) {
					const boundaryKey = (err.boundary || []).sort().join(',')
					const contextKey = (err.context || []).sort().join(',')
					const key = `${boundaryKey}|${contextKey}`
					if (!groupedByContext[key]) groupedByContext[key] = []
					groupedByContext[key].push(err)
				}

				for (const group of Object.values(groupedByContext)) {
					let groupMd = ''
					for (const err of group) {
						const loc = err.file || err.check || '?'
						const msg = err.error || 'Unknown error'
						const taskStr = `- [ ] [${auditorKey}] ${loc}: \`${msg}\`\n`

						// Use a more precise check to avoid partial matches
						if (!finalMd.includes(taskStr) && !groupMd.includes(taskStr)) {
							groupMd += taskStr
							if (err.suggestion) groupMd += `  - **Suggested Fix**: \`${err.suggestion}\`\n`
						}
					}

					if (groupMd) {
						const first = group[0]
						if (first.boundary?.length) {
							const boundaryStr = `**Boundary**: ${first.boundary.map((f) => `[@[${f}]](./${f})`).join(', ')}\n`
							if (!finalMd.includes(boundaryStr) && !groupMd.includes(boundaryStr)) {
								groupMd += boundaryStr
							}
						}
						if (first.context?.length) {
							const contextStr = `**Context**: ${first.context.map((f) => `[@[${f}]](./${f})`).join(', ')}\n`
							if (!finalMd.includes(contextStr) && !groupMd.includes(contextStr)) {
								groupMd += contextStr
							}
						}
						finalMd += groupMd
					}
				}
			}

			if (healCmds.length > 0) {
				const subagentsTitle = t(ArchitectureAuditor.UI.report_subagents_title)
				if (!finalMd.includes(subagentsTitle)) {
					finalMd += `\n\n${subagentsTitle}\n`
				}
				for (const cmd of healCmds) {
					const cmdStr = `- \`${cmd}\`\n`
					if (!finalMd.includes(`\`${cmd}\``)) {
						finalMd += cmdStr
					}
				}
			}

			const nextMdPath = this._.db?.location(this.dir + '/next.md') ?? ''
			if (nextMdPath) {
				await db.saveDocument(nextMdPath, finalMd)
				yield show(t(ArchitectureAuditor.UI.report_written), 'success')
			} else {
				yield show(t(ArchitectureAuditor.UI.report_failed), 'warn')
			}
		} else {
			yield show(t('No new tasks added to next.md'), 'success')
		}

		const summaryRows = auditorsConfig.map((config) => {
			const score = scores[config.key] || { success: false }
			const status = score.success ? 'OK' : 'FAIL'
			const details = score.crashed ? 'Crashed' : score.success ? 'Done' : 'Issues found'
			return `| ${config.title} | ${status} | ${details} |`
		})

		const summaryMd = [
			`# ${t(ArchitectureAuditor.UI.title)}`,
			'',
			'| Auditor | Status | Details |',
			'| :--- | :--- | :--- |',
			...summaryRows,
		].join('\n')

		yield progress(t(ArchitectureAuditor.UI.done))
		yield show(summaryMd)
		return result(
			{
				success: overallSuccess,
				score: pct,
				metrics: { passed: passedCount, total: totalCount, pct },
				...scores,
				errors: allErrors,
			},
			overallSuccess,
		)
	}
}

export { ArchitectureAuditor }
