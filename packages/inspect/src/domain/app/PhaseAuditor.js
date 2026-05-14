import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show } from '@nan0web/ui'

/**
 * @typedef {Object} PhaseError
 * @property {string} [file]
 * @property {string} [check]
 * @property {string} error
 * @property {string[]} [boundary]
 * @property {string[]} [context]
 */

/**
 * PhaseAuditor — Verifies project lifecycle phase and fundamental system files.
 */
export class PhaseAuditor extends AuditorModel {
	static alias = 'phase'

	/** @type {Object<string, string>} UI messages for audit steps */
	static UI = {
		starting: 'Starting Phase Audit in {dir}...',
		checking_files: 'Checking fundamental files...',
		checking_releases: 'Analyzing releases...',
		phase_1: 'Detected Phase: Stage 1 (Seed - seed.md only)',
		phase_2: 'Detected Phase: Stage 2 (Design - project.md + seed.md)',
		phase_3: 'Detected Phase: Stage 3 (Stable - project.md)',
		phase_4: 'Detected Phase: Stage 4 (Production - Releases found)',
		phase_unknown: 'Detected Phase: Unknown (No seed.md or project.md)',
		missing_file: 'Missing fundamental file: {file}',
		npmignore_missing: 'Public package is missing .npmignore',
		no_package_json: 'package.json not found or invalid',
	}

	/**
	 * Runs the phase and fundamentals audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) throw new Error('DB not found in context')

		yield progress(t(PhaseAuditor.UI.starting, { dir: this.dir }))

		/** @type {PhaseError[]} */
		const errors = []

		yield progress(t(PhaseAuditor.UI.checking_files))

		// Check fundamentals
		const fundamentals = ['CONTRIBUTING.md', 'LICENSE', '.editorconfig']
		for (const file of fundamentals) {
			if (!(await this.fileExists(file))) {
				errors.push({
					file,
					error: t(PhaseAuditor.UI.missing_file, { file }),
					boundary: [file],
					context: ['seed.md', 'project.md'],
				})
				yield show(t(PhaseAuditor.UI.missing_file, { file }), 'warn')
			}
		}

		// Releases detection
		yield progress(t(PhaseAuditor.UI.checking_releases))
		const releases = []
		try {
			if (await this.dirExists('releases')) {
				const releasesDir = db.resolveSync(this.dir, 'releases')
				for await (const entry of db.readDir(releasesDir, { depth: 0, includeDirs: true })) {
					if (entry.isDirectory) {
						// Calculate progress in task.md if it exists
						let progress = { done: 0, total: 0 }
						try {
							const taskPath = db.resolveSync(releasesDir, entry.name, 'task.md')
							const content = await db.loadDocument(taskPath)
							const text = typeof content === 'string' ? content : content.content || ''
							const done = (text.match(/- \[x\]/gi) || []).length
							const pending = (text.match(/- \[ \]/gi) || []).length
							progress = { done, total: done + pending }
						} catch (e) { /* no task.md */ }
						
						releases.push({ name: entry.name, ...progress })
					}
				}
				releases.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
			}
		} catch (e) {
			/* ignore */
		}


		// Phase detection
		const seedPaths = ['seed.md', 'docs/seed.md', 'docs/uk/seed.md', 'docs/en/seed.md']
		const projectPaths = ['project.md', 'docs/project.md', 'docs/uk/project.md', 'docs/en/project.md']

		// Check langs.nan0 for localized validation
		let configuredLangs = []
		try {
			const langs = await db.loadDocument(db.resolveSync(this.dir, 'docs/_/langs.nan0'))
			configuredLangs = Array.isArray(langs) ? langs.map(l => l.locale) : []
		} catch (e) { /* ignore */ }

		let hasSeed = false
		for (const p of seedPaths) {
			if (await this.fileExists(p)) {
				// If localized, check if configured
				const localeMatch = p.match(/docs\/(\w+)\//)
				if (localeMatch) {
					const locale = localeMatch[1]
					if (!configuredLangs.includes(locale)) continue
				}
				hasSeed = true
				break
			}
		}

		let hasProject = false
		for (const p of projectPaths) {
			if (await this.fileExists(p)) {
				// If localized, check if configured
				const localeMatch = p.match(/docs\/(\w+)\//)
				if (localeMatch) {
					const locale = localeMatch[1]
					if (!configuredLangs.includes(locale)) continue
				}
				hasProject = true
				break
			}
		}

		let phase = 'unknown'
		let releaseStatus = { done: 0, total: 0, percentage: 0 }
		
		if (releases.length > 0) {
			// If we have releases but they are not fully done, or if we have new seed/project changes, it might be development
			const latestRelease = releases[releases.length - 1]
			releaseStatus = {
				...latestRelease,
				percentage: latestRelease.total > 0 ? Math.round((latestRelease.done / latestRelease.total) * 100) : 0
			}

			if (releaseStatus.total > 0 && releaseStatus.done < releaseStatus.total) {
				phase = 'development'
				yield show(t('Detected Phase: Development (Release {version} in progress: {percentage}%)', {
					version: releaseStatus.name,
					percentage: releaseStatus.percentage
				}), 'info')
			} else {
				phase = 'production'
				yield show(t(PhaseAuditor.UI.phase_4), 'success')
			}
		} else if (!hasSeed && hasProject) {
			phase = 'stable'
			yield show(t(PhaseAuditor.UI.phase_3), 'success')
		} else if (hasSeed && hasProject) {
			phase = 'transform'
			yield show(t(PhaseAuditor.UI.phase_2), 'success')
		} else if (hasSeed && !hasProject) {
			phase = 'seed'
			yield show(t(PhaseAuditor.UI.phase_1), 'success')
		} else {
			phase = 'unknown'
			yield show(t(PhaseAuditor.UI.phase_unknown), 'warn')
			errors.push({
				check: 'phase.lifecycle',
				error: t(PhaseAuditor.UI.phase_unknown),
				boundary: ['seed.md', 'project.md'],
				context: ['package.json'],
			})
		}

		// package.json and .npmignore
		let isPrivate = false
		try {
			const pkg = await db.loadDocument(db.resolveSync(this.dir, 'package.json'))
			isPrivate = pkg.private === true
		} catch (e) {
			errors.push({
				file: 'package.json',
				error: t(PhaseAuditor.UI.no_package_json),
				boundary: ['package.json'],
				context: ['.'],
			})
			yield show(t(PhaseAuditor.UI.no_package_json), 'error')
		}

		if (!isPrivate) {
			if (!(await this.fileExists('.npmignore'))) {
				errors.push({
					file: '.npmignore',
					error: t(PhaseAuditor.UI.npmignore_missing),
					boundary: ['.npmignore'],
					context: ['package.json'],
				})
				yield show(t(PhaseAuditor.UI.npmignore_missing), 'error')
			}
		}

		return result({
			success: errors.length === 0,
			errors,
			phase,
			progress: releaseStatus,
			isPrivate,
			systemFiles: {
				missing: errors.filter((e) => e.file && fundamentals.includes(e.file)).map((e) => e.file),
			},
			npmignoreChecked: !isPrivate,
			releases,
		})
	}
}
