import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { DocsParser } from "@nan0web/test"

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
	const stream = fs.findStream("packages/", {
		filter: (uri) => {
			return !uri.inIncludes("/node_modules/", "/.git/")
		}
	})
	let checkpoint = Date.now()
	let count = 0
	for await (const entry of stream) {
		++count
		if (Date.now() - checkpoint > 1_000) {
			checkpoint = Date.now()
			console.info(count + " files found ..")
		}
	}
	const db = fs.extract("packages/")
	/**
	 * @docs
	 * # @nan0web/monorepo
	 *
	 * @todo write desc
	 *
	 * This document is available in other languages:
	 * - [Ukrainian 🇺🇦](./docs/uk/README.md)
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/monorepo")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/monorepo")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/monorepo
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/monorepo")
	})
	/**
	 * @docs
	 * ## Packages
	 *
	 * Table of the packages and their status
	 *
	 * %PACKAGES%
	 */
	it("Statuses are updated on every git push", () => {
		assert.ok(1)
	})
	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})
	/**
	 * @docs
	 * ## License
	 */
	it("How to license? See the [ISC LICENSE](./LICENSE) file.", async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})

// Helper function to generate packages table
async function generatePackagesTable() {
	const packageDirs = new Set()
	const db = fs.extract("packages/")
	for (const [key] of db.meta) {
		const [name, dir] = key.split("/")
		if (name === "packages" && dir) {
			packageDirs.add(dir)
		}
	}

	let table = "| Package | Status | NPM version | Documentation |\n|---------|---------|---------|--------|\n"
	for (const pkgName of packageDirs) {
		table += `| [\`${pkgName}\`](./packages/${pkgName}) |  | | ⏳ Calculating... |\n`
	}
	return table
}
