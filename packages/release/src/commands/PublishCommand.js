/**
 * PublishCommand – Message‑based version of the old `PublishCommand`.
 *
 * Publishes the current package to NPM and creates a Git tag.
 *
 * Body schema:
 *   major | minor | patch – optional version bump flag.
 *
 * @module release/commands/PublishCommand
 */

import { Message, OutputMessage } from '@nan0web/co'

import Command, { CommandBody } from './Command.js'

class PublishBody extends CommandBody {
	static major = { help: 'Bump major version', defaultValue: false }
	static minor = { help: 'Bump minor version', defaultValue: false }
	static patch = { help: 'Bump patch version', defaultValue: false }

	/** @type {boolean} */
	major = false
	/** @type {boolean} */
	minor = false
	/** @type {boolean} */
	patch = false

	constructor({ major = false, minor = false, patch = false } = {}) {
		super()
		this.major = Boolean(major)
		this.minor = Boolean(minor)
		this.patch = Boolean(patch)
	}
}

export default class PublishCommand extends Command {
	static name = 'publish'
	static help = 'Publish npm packages'
	static Body = PublishBody

	/** @type {PublishBody} */
	body

	/** @param {Partial<Command> & { body?: Partial<PublishBody> }} [input={}] */
	constructor(input = {}) {
		super(input)
		const { body = new PublishBody() } = Message.parseBody(input, PublishBody)
		this.body = new PublishBody(body)
	}

	/** @returns {AsyncGenerator<OutputMessage>} */
	async *run() {
		const bump = this.body.major
			? 'major'
			: this.body.minor
				? 'minor'
				: this.body.patch
					? 'patch'
					: null
		if (bump) {
			await this._run('npm', ['version', bump], 'Failed to bump version')
		}
		const pkg = await this.fs.loadDocument('package.json', {})
		const tag = `v${pkg.version}`

		yield new OutputMessage(`🛜 nan0release: publishing @${pkg.name}@${pkg.version}`)

		await this._run('git', ['diff', '--quiet'], 'Uncommitted changes found')

		await this._run('git', ['pull'], 'Failed to pull latest changes')
		await this._run('npm', ['run', 'clean'], 'Clean failed')
		await this._run('npm', ['run', 'build'], 'Build failed')
		await this._run('npm', ['test'], 'Tests failed')

		const tagsResult = await this._run('git', ['tag'], 'Failed to get tags')
		const tags = tagsResult.text.split('\n').filter(Boolean)

		if (!tags.includes(tag)) {
			await this._run(
				'git',
				['tag', '-a', tag, '-m', `Release ${pkg.version}`],
				'Tag creation failed',
			)
			yield new OutputMessage({
				content: [`Tag ${tag} created`],
				type: OutputMessage.TYPES.SUCCESS,
			})
		} else {
			yield new OutputMessage({
				content: [`Tag ${tag} already exists`],
				type: OutputMessage.TYPES.WARNING,
			})
		}

		await this._run('pnpm', ['publish', '--access', 'public'], 'Publish to npm failed')
		await this._run('git', ['push', 'origin', 'main', '--no-verify'], 'Git push failed')
		await this._run('git', ['push', 'origin', '--tags', '--no-verify'], 'Tag push failed')

		yield new OutputMessage({
			content: [`${pkg.name}@${pkg.version} published.`],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}
}
