import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { before, beforeEach, describe, it } from 'node:test'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser } from '@nan0web/test'
import { CatalogEngine } from './index.js'

const fs = new FS()
let pkg

before(async () => {
	pkg = await fs.loadDocument('package.json', {})
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

function docs() {
	/**
	 * @docs
	 * # @nan0web/catalog
	 *
	 * Universal catalog engine for NaN0Web — filtering, search, and data thinkers.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/catalog
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/catalog')
	})

	/**
	 * @docs
	 * ## Usage
	 */
	it('How to use CatalogEngine?', () => {
		// import { CatalogEngine } from '@nan0web/catalog'
		const engine = new CatalogEngine([{ id: '1', name: 'Item 1', type: 'product' }])
		assert.equal(engine.getItems().length, 1)
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		assert.ok(true)
	})
}

describe('README.md testing', docs)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const text = String(parser.decode(docs))
	await fs.saveDocument('README.md', text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered [${Intl.NumberFormat('en-US').format(Buffer.byteLength(text))}b]`, async () => {
		const saved = fsNode.readFileSync('README.md', 'utf-8')
		assert.ok(saved.includes('## Installation'), 'README was not generated')
	})
})
