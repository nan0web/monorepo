import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import '@nan0web/test/jsdom'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser } from '@nan0web/test'
import { toSvg, toElement } from './index.js'
import { BsBank2, BsStar } from './sets/bs.js'
import { BsHeart } from './sets/bs.js'
import { iconChar } from './adapters/cli.js'

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/icons
	 *
	 * 🇺🇦 [Українська](./docs/uk/README.md)
	 *
	 * Framework-agnostic SVG icons from react-icons sets — zero React dependency at runtime.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/icons` package provides a lightweight, universal way to use popular icon sets (like Bootstrap, FontAwesome, Material Design) in any environment (Browser, Node.js, CLI, Lit, React).
	 *
	 * It works by extracting icon data at build time, allowing you to render icons as pure SVG strings or DOM elements without bundling heavy React libraries.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/icons
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/icons')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/icons
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/icons')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### SVG Strings
	 *
	 * Perfect for server-side rendering or template literals.
	 */
	it('How to render icon as SVG string?', () => {
		//import { toSvg } from '@nan0web/icons'
		//import { BsBank2 } from '@nan0web/icons/bs'
		const svg = toSvg(BsBank2, { size: 24, class: 'text-primary' })

		console.info(svg.startsWith('<svg')) // true
		console.info(svg.includes('width="24"')) // true
		console.info(svg.includes('class="text-primary"')) // true

		assert.ok(console.output()[0][1])
		assert.ok(console.output()[1][1])
		assert.ok(console.output()[2][1])
	})

	/**
	 * @docs
	 * ### DOM Elements
	 *
	 * Create real SVG elements for direct DOM manipulation.
	 */
	it('How to render icon as DOM element?', () => {
		//import { toElement } from '@nan0web/icons'
		//import { BsStar } from '@nan0web/icons/bs'
		const el = toElement(BsStar)

		console.info(el.localName) // svg
		console.info(el.getAttribute('viewBox')) // 0 0 16 16

		assert.equal(console.output()[0][1], 'svg')
		assert.equal(console.output()[1][1], '0 0 16 16')
	})

	/**
	 * @docs
	 * ### Multiple Icon Sets
	 *
	 * You can mix icons from different sets in the same project.
	 */
	it('How to use multiple icon sets?', () => {
		//import { toSvg } from '@nan0web/icons'
		//import { BsHeart } from '@nan0web/icons/bs'
		const svg = toSvg(BsHeart, { size: 32 })

		console.info(svg.includes('width="32"')) // true
		console.info(svg.includes('height="32"')) // true

		assert.ok(console.output()[0][1])
		assert.ok(console.output()[1][1])
	})

	/**
	 * @docs
	 * ### CLI Usage
	 *
	 * Use icons in your CLI tools with terminal-friendly characters.
	 */
	it('How to use icons in CLI?', () => {
		//import { iconChar } from '@nan0web/icons/adapters/cli'
		//import { BsBank2 } from '@nan0web/icons/bs'
		const char = iconChar(BsBank2)

		console.info(char) // 🏦
		console.info(iconChar({ tag: 'svg' }, '●')) // ●

		assert.equal(console.output()[0][1], '🏦')
		assert.equal(console.output()[1][1], '●')
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to participate? – [see CONTRIBUTING.md]($pkgURL/blob/main/CONTRIBUTING.md)', async () => {
		/** @docs */
		const text = readFileSync('CONTRIBUTING.md', 'utf8')
		assert.ok(String(text).includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('ISC LICENSE – [see full text]($pkgURL/blob/main/LICENSE)', async () => {
		/** @docs */
		const text = readFileSync('LICENSE', 'utf8')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	const src = await fs.loadDocument('src/README.md.js', '')
	const text = String(parser.decode(src))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const str = readFileSync('README.md', 'utf8')
		assert.ok(str.includes('Usage'))
	})
})
