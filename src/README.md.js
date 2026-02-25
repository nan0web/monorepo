import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { DocsParser } from '@nan0web/test'

const fs = new DB()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
async function testRender() {
	const stream = fs.findStream('packages/', {
		filter: (uri) => {
			return !uri.inIncludes('/node_modules/', '/.git/')
		},
	})
	let checkpoint = Date.now()
	let count = 0
	for await (const entry of stream) {
		++count
		if (Date.now() - checkpoint > 1_000) {
			checkpoint = Date.now()
			console.info(count + ' files found ..')
		}
	}
	const db = fs.extract('packages/')
	/**
	 * @docs
	 * # @nan0web/monorepo
	 *
	 * > **🧭 FUNDAMENTAL**: Before diving in, read the [SYSTEM.md](SYSTEM.md).
	 * > It contains the **Philosophy of Will**, Coding Standards, and Lux-Level Protocols used across all projects.
	 *
	 * ## 🌐 Vision: One Logic, Many UI
	 *
	 * NanoWeb is a universal engine where business logic (models, validation, algorithms) is strictly decoupled from its presentation.
	 *
	 * - **Pure Logic**: Models and services are platform-agnostic.
	 * - **Multi-UI Adapters**: The same logic drives CLI, Web (React/Lit), Chat, and Voice interfaces.
	 * - **Living Documentation**: Documentation is derived directly from tests (like this README), ensuring it never goes stale.
	 *
	 * ## 🏛️ Architecture
	 *
	 * The monorepo is organized into specialized layers:
	 *
	 * - **`apps/`**: Consumer applications (e.g., `nan0web.app`, `llimo.app`).
	 * - **`packages/`**: Core libraries and UI adapters.
	 *   - `ui-core`: Framework-agnostic UI logic.
	 *   - `ui-cli`: Premium terminal interface with "Lux-level" aesthetics.
	 *   - `db-fs`: Document-based filesystem database.
	 *   - `i18n`: Hierarchical translation engine.
	 *
	 * This document is available in other languages:
	 * - [Ukrainian 🇺🇦](./docs/uk/README.md)
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/monorepo')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/monorepo')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/monorepo')
	})
	/**
	 * @docs
	 * ## Applications
	 * - [LLiMo chat and developer application with the help of Ai](https://github.com/nan0web/llimo.app/)
	 * - Auth.app - user authorization, registration and other standard auth features
	 * - Editor.app - editing data, basically for nan0web projects
	 *
	 * ## Packages
	 *
	 * Table of the packages and their status
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 */
	it('Statuses are updated on every git push', () => {
		assert.ok(1)
	})
	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})
	/**
	 * @docs
	 * ## License
	 */
	it('How to license? See the [ISC LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(text.includes('## License'))
	})
})

// Helper function to generate packages table
async function generatePackagesTable() {
	const packageDirs = new Set()
	const db = fs.extract('packages/')
	for (const [key] of db.meta) {
		const [name, dir] = key.split('/')
		if (name === 'packages' && dir) {
			packageDirs.add(dir)
		}
	}

	let table =
		'| Package | Status | NPM version | Documentation |\n|---------|---------|---------|--------|\n'
	for (const pkgName of packageDirs) {
		table += `| [\`${pkgName}\`](./packages/${pkgName}) |  | | ⏳ Calculating... |\n`
	}
	return table
}
