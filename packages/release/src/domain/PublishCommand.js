import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'

export default class PublishCommand extends ModelAsApp {
	/** @type {boolean} Bump major version */
	major = false
	/** @type {boolean} Bump minor version */
	minor = false
	/** @type {boolean} Bump patch version */
	patch = false

	static major = {
		help: 'Bump major version',
		default: false,
	}
	static minor = {
		help: 'Bump minor version',
		default: false,
	}
	static patch = {
		help: 'Bump patch version',
		default: false,
	}
	static UI = {
		title: 'publish',
		help: 'Publish npm packages',
	}

	/**
	 * @param {Partial<PublishCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const bump = this.major ? 'major' : this.minor ? 'minor' : this.patch ? 'patch' : null

		if (bump) {
			const bumpResult = await runSpawn('npm', ['version', bump])
			if (bumpResult.code !== 0) throw new Error('Failed to bump version')
		}

		const db = /** @type {any} */ (this._).db
		const pkg = await db.loadDocument('package.json', {})
		const tag = `v${pkg.version}`

		yield show(`🛜 nan0release: publishing @${pkg.name}@${pkg.version}`)

		const diffRes = await runSpawn('git', ['diff', '--quiet'])
		if (diffRes.code !== 0) throw new Error('Uncommitted changes found')

		const pullRes = await runSpawn('git', ['pull'])
		if (pullRes.code !== 0) throw new Error('Failed to pull latest changes')

		const cleanRes = await runSpawn('npm', ['run', 'clean'])
		if (cleanRes.code !== 0) throw new Error('Clean failed')

		const buildRes = await runSpawn('npm', ['run', 'build'])
		if (buildRes.code !== 0) throw new Error('Build failed')

		const testRes = await runSpawn('npm', ['test'])
		if (testRes.code !== 0) throw new Error('Tests failed')

		const tagsResult = await runSpawn('git', ['tag'])
		if (tagsResult.code !== 0) throw new Error('Failed to get tags')
		const tags = tagsResult.text.split('\n').filter(Boolean)

		if (!tags.includes(tag)) {
			const tagRes = await runSpawn('git', ['tag', '-a', tag, '-m', `Release ${pkg.version}`])
			if (tagRes.code !== 0) throw new Error('Tag creation failed')
			yield show(`Tag ${tag} created`, 'success')
		} else {
			yield show(`Tag ${tag} already exists`, 'warn')
		}

		const pubRes = await runSpawn('pnpm', ['publish', '--access', 'public'])
		if (pubRes.code !== 0) throw new Error('Publish to npm failed')

		const pushRes = await runSpawn('git', ['push', 'origin', 'main', '--no-verify'])
		if (pushRes.code !== 0) throw new Error('Git push failed')

		const pushTagsRes = await runSpawn('git', ['push', 'origin', '--tags', '--no-verify'])
		if (pushTagsRes.code !== 0) throw new Error('Tag push failed')

		yield show(`${pkg.name}@${pkg.version} published.`, 'success')
		return result({})
	}
}
