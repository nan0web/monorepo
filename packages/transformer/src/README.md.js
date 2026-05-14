import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import Transformer from './Transformer.js'

const fs = new FS()
let pkg
let console = new NoConsole()

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/transformer
	 *
	 * Basic and agnostic transformer.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/transformer` package provides a lightweight and flexible foundation for sequential data transformation.
	 * It allows you to chain multiple transformation steps (transformers) that can encode and decode data in a predictable, composable way.
	 *
	 * A `Transformer` instance collects transformer objects and applies their `encode` or `decode` methods in sequence.
	 * Each transformer may implement one or both methods, and the process is fully asynchronous, allowing integration with async operations.
	 *
	 * This package is ideal for:
	 *
	 * - Building data pipelines (e.g., encryption, compression, formatting)
	 * - Creating serialization/deserialization layers
	 * - Developing middleware-like processing sequences
	 * - Any scenario where data must pass through multiple stages of transformation
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/transformer
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/transformer')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/transformer
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/transformer')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/transformer
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/transformer')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Transformation
	 *
	 * Create a `Transformer` and add transformer objects with `encode` and/or `decode` methods.
	 */
	it('How to chain multiple encoders?', async () => {
		//import { Transformer } from '@nan0web/transformer'
		const transformer = new Transformer()

		const upperCase = {
			encode: async (data) => data.toUpperCase(),
			decode: async (data) => data.toLowerCase(),
		}

		const addPrefix = {
			encode: async (data) => `[ENC] ${data}`,
			decode: async (data) => data.replace(/^\[ENC\]\s/i, ''),
		}

		transformer.addTransformer(upperCase)
		transformer.addTransformer(addPrefix)

		const encoded = await transformer.encode('hello world')
		console.info(encoded) // [ENC] HELLO WORLD

		const decoded = await transformer.decode(encoded)
		console.info(decoded) // hello world
		assert.strictEqual(console.output()[0][1], '[ENC] HELLO WORLD')
		assert.strictEqual(console.output()[1][1], 'hello world')
	})

	/**
	 * @docs
	 */
	it('How to add and remove transformers dynamically?', () => {
		//import { Transformer } from '@nan0web/transformer'
		const transformer = new Transformer()

		const spyTransformer = {
			encode: async (data) => `${data} • spy`,
			decode: async (data) => data.replace(/ • spy$/, ''),
		}

		transformer.addTransformer(spyTransformer)
		console.info(transformer.transformers) // ← [spyTransformer]

		transformer.removeTransformer(spyTransformer)
		console.info(transformer.transformers) // ← []
		assert.deepStrictEqual(console.output()[0][1], [spyTransformer])
		assert.deepStrictEqual(console.output()[1][1], [])
	})

	/**
	 * @docs
	 * ### Skip Non-Implementing Transformers
	 *
	 * Transformers without `encode` or `decode` methods are skipped automatically.
	 */
	it('How to ensure only transformers with encode/decode are applied?', async () => {
		//import { Transformer } from '@nan0web/transformer'
		const transformer = new Transformer()

		const validEncoder = {
			encode: async (data) => data + '•encoded',
		}

		const invalidTransformer = {
			process: async (data) => data,
		}

		transformer.addTransformer(validEncoder)
		transformer.addTransformer(invalidTransformer)

		const result = await transformer.encode('data')
		console.info(result) // data•encoded
		assert.strictEqual(console.output()[0][1], 'data•encoded')
	})

	/**
	 * @docs
	 * ### Asynchronous Transformers
	 *
	 * All transformations are `async`, enabling integration with promises and async operations.
	 */
	it('How to use asynchronous transformations with delays?', async () => {
		//import { Transformer } from '@nan0web/transformer'
		const transformer = new Transformer()

		const delayEncode = {
			encode: async (data) => {
				await new Promise((r) => setTimeout(r, 10))
				return `[DELAYED] ${data}`
			},
		}

		transformer.addTransformer(delayEncode)
		const result = await transformer.encode('test')
		console.info(result) // [DELAYED] test
		assert.strictEqual(console.output()[0][1], '[DELAYED] test')
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### Transformer
	 *
	 * A class that manages a sequence of transformers.
	 *
	 * * **Constructor**
	 *   * `new Transformer()` — creates an empty transformer chain.
	 *
	 * * **Properties**
	 *   * `transformers` – array of transformer objects added via `addTransformer`.
	 *
	 * * **Methods**
	 *   * `encode(data)` – applies all `encode` methods in sequence.
	 *   * `decode(data)` – applies all `decode` methods in sequence.
	 *   * `addTransformer(t)` – adds a transformer object to the chain.
	 *   * `removeTransformer(t)` – removes a specific transformer object from the chain.
	 *
	 * All methods return promises and are `await`-safe.
	 *
	 * ## Java•Script
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 * Run local experiments using the playground script.
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Run the playground
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
		const exists = await fs.loadDocument('play/main.js')
		assert.ok(exists, 'play/main.js should exist')
	})

	/**
	 * @docs
	 * ## Contributing
	 *
	 * This project follows strict testing and linting rules.
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
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
	 *
	 * Licensed under ISC.
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	let text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${Intl.NumberFormat('en-US').format(Buffer.byteLength(text))}b]`, async () => {
		const saved = await fs.loadDocument('README.md')
		assert.ok(saved.includes('## License'))
	})
})
