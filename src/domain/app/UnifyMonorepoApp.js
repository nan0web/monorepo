import { ModelAsApp, result, show, progress } from '@nan0web/ui'

export default class UnifyMonorepoApp extends ModelAsApp {
	static help = 'Recursively removes all nested .git folders in the monorepo.'

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
		const dirs = ['@app/packages', '@app/apps']
		let removedCount = 0

		for (const dirUri of dirs) {
			yield progress(t(UnifyMonorepoApp.UI.scanning, { dir: dirUri }))

			for await (const entry of db.readDir(dirUri, { depth: 1, includeDirs: true })) {
				if (!entry.isDirectory) continue

				const gitUri = `${entry.path}/.git`
				const gitStat = await db.stat(gitUri)

				if (gitStat.exists) {
					if (this.dryRun) {
						yield show(t(UnifyMonorepoApp.UI.removingGitDry, { path: gitUri }))
						removedCount++
					} else {
						yield show(t(UnifyMonorepoApp.UI.removingGit, { path: gitUri }))
						try {
							await db.dropDocument(gitUri, { recursive: true })
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
