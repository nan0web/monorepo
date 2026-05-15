import { ModelAsApp, result, show, progress } from '@nan0web/ui'

export default class UnifyMonorepoApp extends ModelAsApp {
	static help = { help: 'Unify monorepo structure by removing redundant .git directories.', default: false }

	static dryRun = {
		alias: 'n',
		help: 'Dry run mode: list actions without performing them.',
		default: false,
	}

	static UI = {
		title: 'Unify Monorepo',
		scanning: 'Scanning {dir}',
		removingGit: 'Removing nested .git at {path}',
		removingGitDry: '[DRY RUN] Would remove .git at {path}',
		success: 'Monorepo unified. Total .git folders removed: {count}',
		successDry: '[DRY RUN] Finished scanning. Total .git folders found: {count}',
		error: 'Error removing {path}: {message}',
	}

	/**
	 * @param {Partial<UnifyMonorepoApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} */
		this.dryRun
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (this.help) return yield* super.run()

		const { t, db } = this._
		if (!db) return result({ status: 'cancelled', reason: 'No DB found' })
		const _db = db
		const dirs = ['@app/packages', '@app/apps']
		let removedCount = 0

		for (const dirUri of dirs) {
			yield progress(t(UnifyMonorepoApp.UI.scanning, { dir: dirUri }))

			for await (const entry of _db.readDir(dirUri, { depth: 1, includeDirs: true })) {
				if (!entry.isDirectory) continue

				const gitUri = `${entry.path}/.git`
				const gitStat = await _db.stat(gitUri)

				if (gitStat && gitStat.exists) {
					if (this.dryRun) {
						yield show(t(UnifyMonorepoApp.UI.cleaningDry, { dir: gitUri }))
						removedCount++
					} else {
						yield progress(t(UnifyMonorepoApp.UI.cleaning, { dir: gitUri }))
						try {
							await _db.dropDocument(gitUri, { recursive: true })
							removedCount++
						} catch (/** @type {any} */ err) {
							yield show(
								t(UnifyMonorepoApp.UI.error, { path: gitUri, message: err.message }),
								'error',
							)
						}
					}
				}
			}
		}

		if (this.dryRun) {
			yield show(t(UnifyMonorepoApp.UI.successDry, { count: removedCount }))
		} else {
			yield show(t(UnifyMonorepoApp.UI.success, { count: removedCount }), 'success')
		}

		return result({})
	}
}
