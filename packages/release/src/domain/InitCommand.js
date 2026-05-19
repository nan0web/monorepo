import { ModelAsApp, result, show } from '@nan0web/ui'

export default class InitCommand extends ModelAsApp {
	static version = {
		help: 'Release version',
		default: '',
		errorRequired: 'Version is required (e.g. --version=1.0.0 or --version=v1.0.0)',
	}
	static UI = {
		title: 'init',
		help: 'Initialize a new release structure',
	}

	/**
	 * @param {Partial<InitCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Release version */ this.version
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = this._
		if (!this.version) {
			throw new Error(t(InitCommand.version.errorRequired))
		}
		const v = this.version.startsWith('v') ? this.version : `v${this.version}`

		const parts = v.replace('v', '').split('.')
		const major = parts[0] || '0'
		const minor = parts[1] || '0'

		const { mkdirSync, writeFileSync } = await import('node:fs')
		const { join } = await import('node:path')

		const dir = join(process.cwd(), 'releases', major, minor, v)
		mkdirSync(dir, { recursive: true })

		const taskPath = join(dir, 'task.md')
		writeFileSync(taskPath, `# Release ${v}\n\n- [ ] Task 1`, 'utf8')

		const specPath = join(dir, 'test.spec.js')
		writeFileSync(
			specPath,
			`import test from 'node:test'\nimport assert from 'node:assert'\n\ntest('Sample spec', () => {\n\tassert.ok(true)\n})\n`,
			'utf8',
		)

		yield show(`✅ Initialized release ${v} in ${dir}`, 'success')

		return result({})
	}
}
