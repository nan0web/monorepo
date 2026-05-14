/**
 * DepsCommand – Message‑based version of the old `DepsCommand`.
 *
 * Checks and optionally fixes workspace / link dependencies.
 *
 * Body schema:
 *   fix – boolean – whether to apply fixes (default: false)
 *
 * @module release/commands/DepsCommand
 */

import { Message, OutputMessage } from '@nan0web/co'

import Command from './Command.js'

class DepsBody {
	/** @type {boolean} */
	fix = false
	static fix = {
		help: 'Apply fixes automatically',
		defaultValue: false,
	}
	/** @type {boolean} */
	latest = false
	static latest = {
		help: 'Update @nan0web packages to the latests available versions',
		defaultValue: false,
	}
	constructor(input = {}) {
		const { fix = this.fix, latest = this.latest } = Message.parseBody(input, DepsBody)
		this.fix = Boolean(fix)
		this.latest = Boolean(latest)
	}
}

export default class DepsCommand extends Command {
	static name = 'deps'
	static help = 'Dependencies manager'
	static Body = DepsBody
	/** @type {DepsBody} */
	body

	/** @param {Partial<DepsBody>} [input={}] */
	constructor(input = {}) {
		super({})
		this.body = Command.parseBody(input, DepsBody)
	}

	/**
	 * @param {DepsCommand} [msg]
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	async *run(msg = new DepsCommand()) {
		const pkg = await this.fs.loadDocument('package.json', {})
		yield new OutputMessage(['Loaded package.json', JSON.stringify(pkg).length + ' bytes'])
		const deps = {
			devDependencies: pkg?.devDependencies ?? {},
			dependencies: pkg?.dependencies ?? {},
			peerDependencies: pkg?.peerDependencies ?? {},
		}
		const fixes = new Map()
		const fails = new Set()

		const isLocal = (ver) =>
			['workspace:', 'link:'].some((p) => String(ver).toLowerCase().startsWith(p))

		const changes = new Map()

		for (const [group, map] of Object.entries(deps)) {
			yield new OutputMessage(`${group} (${Object.keys(map).length} items)`)
			for (const [dep, ver] of Object.entries(map ?? {})) {
				if (isLocal(ver) || msg.body.latest) {
					const result = await this._run(
						'npm',
						['info', dep, '--json'],
						'Cannot retrieve npm package info',
					)
					try {
						const data = JSON.parse(result.text)
						if (data.version) {
							fixes.set(dep, data.version)
							yield new OutputMessage({
								content: [`  ${dep}: ${ver} → ${data.version}`],
								type: OutputMessage.TYPES.WARNING,
							})
						} else {
							fails.add(dep)
							yield new OutputMessage({
								content: [`  ${dep}: 404 — not found`],
								type: OutputMessage.TYPES.ERROR,
							})
						}
					} catch (/** @type {any} */ err) {
						yield new OutputMessage(err)
					}
				} else {
					yield new OutputMessage({
						content: [`  ${dep}: ${ver}`],
						type: OutputMessage.TYPES.SUCCESS,
					})
				}
			}
		}

		if (fails.size) {
			yield new OutputMessage(
				new Error(`Some dependencies are not yet published on npm: ${[...fails].join(', ')}`),
			)
			return
		}

		if ((msg.body.fix || msg.body.latest) && fixes.size) {
			for (const [dep, ver] of fixes) {
				// naive fix – replace in package.json
				const args = ['install']
				if (pkg.devDependencies?.[dep]) {
					pkg.devDependencies[dep] = ver
					args.push('--save-dev')
				}
				if (pkg.dependencies?.[dep]) pkg.dependencies[dep] = ver
				args.push(dep + '@latest')
				if (msg.body.latest) {
					yield new OutputMessage([`Installing dependency`])
					await this._run('npm', args)
				}
				changes.set(dep, `${dep}: ${ver}`)
				yield new OutputMessage({
					content: [`Fixed ${dep} → ${ver}`],
					type: OutputMessage.TYPES.SUCCESS,
				})
			}
			await this.fs.saveDocument('package.json', pkg)
			yield new OutputMessage({
				content: [`Fixes saved (${changes.size} changes)`],
				type: OutputMessage.TYPES.SUCCESS,
			})
			yield new OutputMessage({ content: ['Dependencies fixed'] })
		} else {
			yield new OutputMessage(`Run with --fix to apply ${fixes.size} available fixes`)
			yield new OutputMessage({ content: ['Dependencies check completed'] })
		}
	}
}
