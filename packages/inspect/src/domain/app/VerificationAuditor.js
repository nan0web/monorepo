import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show, render } from '@nan0web/ui'

/**
 * @typedef {Object} VerificationError
 * @property {string} check Name of the verification check.
 * @property {string} error Error key for i18n.
 */

/**
 * VerificationAuditor — Verifies existence of play/, unit tests, and ProvenDocs.
 */
export class VerificationAuditor extends AuditorModel {
	static alias = 'verification'

	/** @type {Object<string, string>} UI messages for verification steps */
	static UI = {
		starting: 'Starting Verification Audit in {dir}...',
		checking_play: 'Checking playground (play/)...',
		checking_tests: 'Checking unit test coverage...',
		checking_snapshots: 'Checking snapshots...',
		checking_provendoc: 'Checking ProvenDoc (README.md.js)...',
		missing_play: 'No play/ directory found — playground is mandatory for every package',
		missing_tests: 'No *.test.js or *.story.js files found in src/',
		missing_provendoc: 'README.md.js (ProvenDoc) not found',
		snapshots_ok: 'Snapshots: OK',
		snapshots_missing: 'No snapshots/ directory found — consider adding snapshot tests',
		play_ok: 'Playground: OK',
		tests_ok: 'Unit tests: OK',
		provendoc_ok: 'ProvenDoc: OK',
	}

	/**
	 * Abstract check for test files, should be implemented by child classes.
	 * @param {import('@nan0web/db').DocumentEntry} entry
	 * @returns {boolean}
	 */
	isTestFile(entry) {
		return false
	}

	/**
	 * Abstract check for ignored directories, should be implemented by child classes.
	 * @param {import('@nan0web/db').DocumentEntry} entry
	 * @returns {boolean}
	 */
	isIgnoredDir(entry) {
		return false
	}

	/**
	 * The pattern missing tests are expected to match (for UI string interpolation).
	 * @returns {string}
	 */
	get missingTestsPattern() {
		return 'src/**/test_*'
	}

	/**
	 * Recursively collect all test files using DB.browse.
	 * @param {string} dir
	 * @returns {Promise<string[]>}
	 * @private
	 */
	async _collectTestFiles(dir) {
		const { db } = this._
		if (!db) throw new Error('DB not found in context')
		const collected = []
		try {
			const filter = (/** @type {import('@nan0web/db').DocumentEntry} */ entry) => {
				if (entry.name.startsWith('.')) return false
				if (this.isIgnoredDir(entry)) return false
				return true
			}
			for await (const entry of db.browse(dir, (/** @type {any} */ ({ depth: Infinity, filter })))) {
				if (entry.isFile && this.isTestFile(entry)) {
					collected.push(entry.path)
				}
			}
		} catch {}
		return collected
	}

	/**
	 * Runs the verification and documentation audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) throw new Error('DB not found in context')

		yield progress(t(VerificationAuditor.UI.starting, { dir: this.dir }) || `Starting Verification Audit in ${this.dir}...`)

		/** @type {VerificationError[]} */
		const errors = []

		// 1. play/ is mandatory
		yield progress(t(VerificationAuditor.UI.checking_play) || 'Checking playground...')
		const hasPlay = await this.dirExists('play')
		if (!hasPlay) {
			errors.push({ check: 'play/', error: VerificationAuditor.UI.missing_play })
			yield render('Alert', {
				title: 'Mandatory directory missing',
				children: t(VerificationAuditor.UI.missing_play) || 'No play/ directory found — playground is mandatory for every package',
				variant: 'error'
			})
		} else {
			yield show(t(VerificationAuditor.UI.play_ok) || 'Playground: OK', 'success')
		}

		// 2. Unit tests check
		yield progress(t(VerificationAuditor.UI.checking_tests) || 'Checking tests...')
		/** @type {string[]} */
		let testFilesCollected = []
		if (await this.dirExists('src')) {
			const srcDir = db.resolveSync(this.dir, 'src')
			testFilesCollected = await this._collectTestFiles(srcDir)
			if (testFilesCollected.length === 0) {
				errors.push({
					check: this.missingTestsPattern,
					error: VerificationAuditor.UI.missing_tests,
				})
				yield show(t(VerificationAuditor.UI.missing_tests) || 'No unit tests found', 'warn')
			} else {
				yield show(t(VerificationAuditor.UI.tests_ok) || 'Unit tests: OK', 'success')
			}
		}

		// 3. ProvenDoc check
		yield progress(t(VerificationAuditor.UI.checking_provendoc) || 'Checking ProvenDoc...')
		const hasProvenDoc =
			(await this.fileExists('src/README.md.js')) ||
			(await this.fileExists('src/docs/README.md.js'))

		if (!hasProvenDoc) {
			errors.push({
				check: 'src/README.md.js',
				error: VerificationAuditor.UI.missing_provendoc,
			})
			yield show(t(VerificationAuditor.UI.missing_provendoc) || 'README.md.js not found', 'warn')
		} else {
			yield show(t(VerificationAuditor.UI.provendoc_ok) || 'ProvenDoc: OK', 'success')
		}

		// 4. Snapshots check
		yield progress(t(VerificationAuditor.UI.checking_snapshots) || 'Checking snapshots...')
		const coreSnaps = await this.dirExists('snapshots/core')
		const cliSnaps = await this.dirExists('snapshots/cli')
		const ssgSnaps = await this.dirExists('snapshots/ssg')
		if (!coreSnaps && !cliSnaps && !ssgSnaps) {
			yield show(t(VerificationAuditor.UI.snapshots_missing) || 'No snapshots found', 'warn')
		} else {
			yield show(t(VerificationAuditor.UI.snapshots_ok) || 'Snapshots: OK', 'success')
		}

		return result({
			success: errors.length === 0,
			errors,
			verification: {
				hasPlayground: hasPlay,
				hasProvenDoc: hasProvenDoc,
				testFiles: testFilesCollected,
				snapshots: {
					core: coreSnaps,
					cli: cliSnaps,
					ssg: ssgSnaps,
				},
			},
		})
	}
}
