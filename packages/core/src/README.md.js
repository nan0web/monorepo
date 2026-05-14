import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser } from '@nan0web/test'
import { AppCore, AppResult, ExecutableCommand, ProjectModel } from './index.js'
import DB from '@nan0web/db'

/**
 * Load package.json once before any test.
 */
let pkg
const fs = new FS()

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as source for README generation.
 *
 * Block comments inside each `it` are extracted by DocsParser to build the final README.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/core
	 *
	 * Core application framework for nan0web providing a lightweight
	 * DB‑backed state container with built‑in internationalisation.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/core')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/core')
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/core
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/core')
	})

	/**
	 * @docs
	 * ## Basic usage – AppCore
	 *
	 * Create an `AppCore` instance with a mock DB and inspect its state.
	 */
	it('How to instantiate AppCore?', () => {
		//import { AppCore } from "@nan0web/core"
		const db = new DB()
		const core = new AppCore({ db, title: 'Demo', uri: '/demo', locale: 'en' })
		console.info(core.title) // ← Demo
		console.info(core.uri) // ← /demo
		assert.equal(core.title, 'Demo')
		assert.equal(core.uri, '/demo')
		assert.equal(core.locale, 'en')
	})

	/**
	 * @docs
	 * ## Internationalisation bootstrap
	 *
	 * Load translation JSON from the DB and obtain a translation function.
	 */
	it('How does bootstrapI18n load translations?', async () => {
		const db = new DB({
			predefined: [['i18n/uk.json', { hello: 'Вітаю!' }]],
		})
		await db.connect()
		const core = new AppCore({ db, locale: 'uk' })
		await core.init()
		const result = core.t('hello')
		console.info(result) // ← Вітаю!
		assert.equal(result, 'Вітаю!')
	})

	/**
	 * @docs
	 * ## State inspection
	 */
	it('How to retrieve current state?', () => {
		const db = new DB()
		const core = new AppCore({ db })
		const state = core.state()
		assert.deepEqual(Object.keys(state), ['data', 'actions', 'meta', 't'])
		assert.ok(typeof state.t === 'function')
	})

	/**
	 * @docs
	 * ## AppResult helper
	 */
	it('How to create an AppResult instance?', () => {
		//import { AppResult } from "@nan0web/core"
		const res = new AppResult({ content: 'Done', priority: 2, meta: { ok: true } })
		console.info(res.content[0]) // ← Done
		assert.equal(res.content[0], 'Done')
		assert.equal(res.priority, 2)
		assert.deepEqual(res.meta, { ok: true })
		assert.equal(res.error, null)
	})

	/**
	 * @docs
	 * ## run() contract
	 *
	 * The base `run` method throws an error – subclasses must implement it.
	 */
	it('How does run() behave when not overridden?', async () => {
		const db = new DB()
		const core = new AppCore({ db })
		//await core.run() // ← throws an error → AppCore: run() must be implemented
		assert.ok(core)
		await assert.rejects(
			async () => {
				await core.run()
			},
			{
				name: 'Error',
				message: 'AppCore: run() must be implemented',
			},
		)
	})

	/**
	 * @docs
	 * ## AppCore Static Meta
	 *
	 * Core components like `AppCore` and `ProjectModel` implement a `static UI`
	 * metadata block defining their semantic display defaults according to the system contract.
	 */
	it('How to get semantic static UI data?', () => {
		//import { AppCore, ProjectModel } from "@nan0web/core"
		console.info(`${AppCore.UI.icon} ${AppCore.UI.title}`) // ← ⚙️ Application Core
		assert.equal(AppCore.UI.title, 'Application Core')
		assert.equal(AppCore.UI.icon, '⚙️')
		assert.equal(ProjectModel.UI.title, 'Project Data')
	})

	/**
	 * ## ExecutableCommand exposure
	 */
	it('Are exported commands available?', () => {
		assert.ok(ExecutableCommand)
	})

	/**
	 * ## TypeScript declarations
	 */
	it('Does package expose declaration files?', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text?.content ?? text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

/* Run the test suite that also generates the README */
describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const readme = await fs.loadDocument('README.md')
		const text = String(readme?.content ?? readme)
		assert.ok(text.includes('## Installation'))
	})
})
