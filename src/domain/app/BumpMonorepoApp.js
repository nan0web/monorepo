import { ModelAsApp, result, show, progress } from '@nan0web/ui'

export default class BumpMonorepoApp extends ModelAsApp {
	static help = 'Bumps version of all packages in the monorepo to a specific version.'

	static version = {
		positional: true,
		help: 'The version to bump to (e.g. 3.0.1).',
		default: '3.0.0',
		errorFormat: 'Invalid format, use X.Y.Z',
		validate: (v) => /^\d+\.\d+\.\d+$/.test(v) || BumpMonorepoApp.version.errorFormat,
	}

	static dryRun = {
		alias: 'n',
		help: 'Dry run mode: list version changes without performing them.',
		default: false,
	}

	static UI = {
		title: 'Bump Monorepo Version',
		newVersionIn: 'New version {version} in {dir}',
		searchingPackages: 'Searching for packages',
		searchingApps: 'Searching for apps',
		updatingVersions: 'Updating versions',
		versionUpdated: '{name}@{old} -> {new}',
		versionUpdatedDry: '[DRY RUN] Would bump {name}@{old} -> {new}',
		wouldNotBump: '{name} is already at {version}',
	}

	/**
	 * @param {Partial<BumpMonorepoApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.version
		/** @type {boolean} */
		this.dryRun
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (this.help) return yield* super.run()

		const { t, db } = this._
		yield show(t(BumpMonorepoApp.UI.newVersionIn, { version: this.version, dir: db.location('') }))
		const ignore = ['node_modules', '.*']
		const packages = []
		
		yield progress(t(BumpMonorepoApp.UI.searchingPackages))
		let i = 0
		for await (const file of db.browse('@app/packages', { ignore })) {
			if ('package.json' === file.name && file.parent.split('/').length === 3) {
				packages.push(file)
			}
			yield progress(t(BumpMonorepoApp.UI.searchingPackages), ++i)
		}
		for await (const file of db.browse('@app/apps', { ignore })) {
			if ('package.json' === file.name && file.parent.split('/').length === 3) {
				packages.push(file)
			}
			yield progress(t(BumpMonorepoApp.UI.searchingApps), ++i)
		}

		// Include root package.json
		const rootPkgStat = await db.stat('@app/package.json')
		if (rootPkgStat.exists) {
			packages.push({ path: '@app/package.json', name: 'package.json' })
		}

		yield progress(t(BumpMonorepoApp.UI.updatingVersions))
		for (const file of packages) {
			const pkg = await db.loadDocument(file.path)
			if (!pkg) continue

			const oldVersion = pkg.version

			if (oldVersion === this.version) {
				yield show(
					t(BumpMonorepoApp.UI.wouldNotBump, {
						name: pkg.name || file.path,
						version: this.version,
					}),
					'info'
				)
				continue
			}

			if (this.dryRun) {
				yield show(
					t(BumpMonorepoApp.UI.versionUpdatedDry, {
						name: pkg.name || file.path,
						old: oldVersion,
						new: this.version,
					}),
				)
			} else {
				pkg.version = this.version
				await db.saveDocument(file.path, pkg)
				yield show(
					t(BumpMonorepoApp.UI.versionUpdated, {
						name: pkg.name || file.path,
						old: oldVersion,
						new: pkg.version,
					}),
					'success',
				)
			}
		}
		return result({})
	}
}
