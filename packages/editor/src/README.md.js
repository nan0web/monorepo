import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import { ModalStack, EditorModel } from './core/index.js'

const fs = new FS()
const pkg = JSON.parse(fsNode.readFileSync('package.json', 'utf8'))

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/editor
	 *
	 * [![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/nan0web/editor)
	 *
	 * **Pure Logic Core** for NaN0 Editor ecosystem. This package contains NO UI dependencies and can be used to build
	 * editor adapters for Lit, React, CLI, or any other framework.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## 🏗 Architecture
	 *
	 * - **EditorModel**: Manages document state, schema, and persistence.
	 * - **ModalStack**: Orchestrates recursive editing (nested modals).
	 * - **PersistenceManager**: Handles save strategies (Cache, Commit, Git).
	 *
	 * ## 📦 Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/editor
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/editor')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/editor
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/editor')
	})

	/**
	 * @docs
	 * ## 📖 API Reference
	 *
	 * ### ModalStack
	 * See `types/core/ModalStack.d.ts` for full definitions.
	 */
	it('How to use ModalStack?', () => {
		//import { ModalStack } from '@nan0web/editor'
		const stack = new ModalStack({ maxDepth: 7 })
		const m1 = { uri: '1.json' }
		stack.push(m1)

		console.info(`Stack depth: ${stack.depth}`) // Stack depth: 1

		assert.deepStrictEqual(stack.current, m1)
		assert.strictEqual(console.output()[0][1], 'Stack depth: 1')
	})

	/**
	 * @docs
	 * ### EditorModel
	 * See `types/core/Editor.d.ts` for full definitions.
	 */
	it('How to use EditorModel?', async () => {
		//import { EditorModel } from '@nan0web/editor'

		// In-memory mock DB
		const db = {
			loadDocument: async () => ({ title: 'Old' }),
			saveDocument: async () => true,
		}

		const model = new EditorModel({ db, uri: 'doc.json' })
		await model.loadDocument()

		model.updateContent({ title: 'New' })
		console.info(model.content.title) // New

		assert.strictEqual(model.content.title, 'New')
		assert.strictEqual(console.output()[0][1], 'New')
	})

	/**
	 * @docs
	 * ## 🛝 UI Playground (Sandbox)
	 *
	 * You can inspect and interact with the editor logic and its Lit UI Sandbox directly in the browser if you have the repo cloned:
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * git clone https://github.com/nan0web/editor.git
		 * cd editor
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(pkg.scripts?.play)
	})

	/**
	 * @docs
	 * ## 🤝 Contributing
	 */
	it('How to contribute? - [check here]($pkgURL/blob/main/CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
	})

	/**
	 * @docs
	 * ## 📜 License
	 */
	it('How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('../../LICENSE') // Look up in monorepo root
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	const sourceCode = fsNode.readFileSync(fileURLToPath(import.meta.url), 'utf-8')
	text = String(parser.decode(sourceCode))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const str = fsNode.readFileSync('README.md', 'utf-8')
		assert.ok(str.includes('## 📖 API Reference'))
		assert.ok(str.includes('npm install'))
		assert.ok(str.includes('UI Playground (Sandbox)'))
	})
})
