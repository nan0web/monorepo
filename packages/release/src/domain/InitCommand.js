import { ModelAsApp, result, show } from '@nan0web/ui'

export default class InitCommand extends ModelAsApp {
	/** @type {string} Release version */
	version = ''

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
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, db } = this._
		if (!db) {
			throw new Error('Database instance ({ db }) is required in InitCommand')
		}
		if (!this.version) {
			throw new Error(t ? t(InitCommand.version.errorRequired) : InitCommand.version.errorRequired)
		}
		const v = this.version.startsWith('v') ? this.version : `v${this.version}`

		const parts = v.replace('v', '').split('.')
		const major = parts[0] || '0'
		const minor = parts[1] || '0'

		const taskPath = `releases/${major}/${minor}/${v}/task.md`
		await db.saveDocument(taskPath, `# Release ${v}\n\n- [ ] Task 1\n`)

		const specPath = `releases/${major}/${minor}/${v}/task.spec.js`
		await db.saveDocument(
			specPath,
			`import test from 'node:test'\nimport assert from 'node:assert'\n\ntest('Release ${v} Specification', () => {\n\tassert.ok(true)\n})\n`,
		)

		yield show(`✅ Initialized release ${v} in releases/${major}/${minor}/${v}`, 'success')

		return result({
			version: v,
			taskPath,
			specPath,
		})
	}
}
