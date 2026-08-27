import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'

/**
 * Command to bump the version of changed packages in the monorepo.
 * @property {string} version Target version to set
 * @property {string} since Git reference to diff against
 * @property {boolean} dryRun Run the command without making any changes
 */
export default class BumpCommand extends ModelAsApp {
	/** @type {string} Target version */
	version = '3.1.1'
	/** @type {string} Git reference to diff against */
	since = 'v3.1.0'
	/** @type {boolean} Run without making changes */
	dryRun = false

	static version = {
		help: 'Target version to set',
		default: '3.1.1',
		positional: true,
	}
	static since = {
		help: 'Git reference to diff against',
		default: 'v3.1.0',
		positional: true,
	}
	static dryRun = {
		alias: 'dry-run',
		default: false,
		help: 'Run the command without making any changes',
	}
	static UI = {
		title: 'bump',
		help: 'Bump version of changed packages in the monorepo',
		bumping: 'Bumping {name} version: {oldVersion} -> {targetVersion} ({dir})',
		skippingAlreadyAtVersion: 'Skipping the same version in {name} version: {version} ({dir})',
		foundChangedPackages: 'Found {count} changed packages:',
		detectingChangedPackages:
			'Detecting changed packages since {sinceRef} for bumping to {targetVersion}...',
		noChangesDetected: 'No package changes detected.',
		errorDb: 'Database not initialized',
	}

	/**
	 * @param {Partial<BumpCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { db, t } = this._
		if (!db) {
			throw new Error(BumpCommand.UI.errorDb)
		}

		if (this.help) {
			return yield* super.run()
		}

		const targetVersion = this.version || '3.1.1'
		const sinceRef = this.since || 'v3.1.0'

		yield show(
			t(BumpCommand.UI.detectingChangedPackages, {
				sinceRef,
				targetVersion,
			})
		)

		const allFiles = new Set()

		const addFilesFromCommand = async (cmd, args) => {
			const res = await runSpawn(cmd, args)
			if (res.code === 0) {
				res.text
					.split('\n')
					.map((f) => f.trim())
					.filter(Boolean)
					.forEach((f) => allFiles.add(f))
			}
		}

		// 1. Files modified since the release tag
		await addFilesFromCommand('git', ['diff', '--name-only', sinceRef])
		// 2. Unstaged changes in the working tree
		await addFilesFromCommand('git', ['diff', '--name-only'])
		// 3. Staged changes
		await addFilesFromCommand('git', ['diff', '--cached', '--name-only'])

		const changedPackages = new Set()
		for (const file of allFiles) {
			const parts = file.split('/')
			if (parts.length >= 2 && (parts[0] === 'packages' || parts[0] === 'apps')) {
				changedPackages.add(`${parts[0]}/${parts[1]}`)
			}
		}

		if (changedPackages.size === 0) {
			yield show(t(BumpCommand.UI.noChangesDetected), 'warn')
			return result({})
		}

		yield show(t(BumpCommand.UI.foundChangedPackages, { count: changedPackages.size }))

		for (const pkgDir of changedPackages) {
			const pkgJsonPath = `@app/${pkgDir}/package.json`
			const pkg = await db.loadDocument(pkgJsonPath, null)
			if (pkg) {
				const oldVersion = pkg.version
				if (oldVersion === targetVersion) {
					yield show(
						t(BumpCommand.UI.skippingAlreadyAtVersion, {
							name: pkg.name,
							version: targetVersion,
							dir: pkgDir,
						}),
						'info'
					)
					continue
				}
				pkg.version = targetVersion
				if (!this.dryRun) {
					await db.saveDocument(pkgJsonPath, pkg)
				}
				yield show(
					t(BumpCommand.UI.bumping, {
						name: pkg.name,
						oldVersion,
						targetVersion,
						dir: pkgDir,
					}),
					this.dryRun ? 'warn' : 'success'
				)
			}
		}
		return result({ success: true })
	}
}
