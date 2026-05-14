import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser } from '@nan0web/test'
import { WebCommentAdapter, CommentModel } from './index.js'

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
	 * # @nan0web/comment
	 *
	 * Universal, zero-hardcode, zero-logic comment & feedback overlay.
	 * Perfect for QA auditing, UI feedback, and contextual page annotations.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/comment
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/comment')
	})

	/**
	 * @docs
	 * ## Architecture
	 * Designed strictly on the OLMUI (One Logic — Many UI) and Architechnomag principles:
	 * 1. **Zero-Logic UI:** The React/Web adapter only handles DOM nodes. Validation rules and flows live in `CommentModel`.
	 * 2. **Zero-Hardcode & i18n:** All translation labels are yielded by the Model, the UI adapters never import static languages.
	 * 3. **Model-as-Schema:** Fully declarative definition of the feedback process.
	 * 4. **URL Scoped:** Comments inherently bind to the current page path, cleanly separating localized variations (e.g., `/uk/` vs `/en/`).
	 *
	 * ## Usage
	 * ### Basic Implementation
	 *
	 * Wrap any simple persistence mechanism (like `localStorage` or `IndexedDB`) 
	 * into a basic DB interface `{ save, loadAll, remove, clear }` and pass it to the adapter.
	 */
	it('How to initialize and start the comment overlay?', async () => {
		//import { WebCommentAdapter } from '@nan0web/comment'
		
		// 1. Create a dummy DB for storing comments
		class DemoDB {
			async save(comment) { console.info('Saved:', comment.text) }
			async loadAll() { return [] }
			async clear() {}
			async remove() {}
		}

		// 2. Initialize the adapter
		const adapter = new WebCommentAdapter({
			db: new DemoDB(),
			t: (key) => key // simple mock translator
		})

		// 3. Start the flow programmatically
		// adapter.start().then(result => console.info(result.action))
		
		assert.ok(adapter)
	})

	/**
	 * @docs
	 * ### Comments Dashboard & Import/Export
	 *
	 * The adapter organically brings a Comments Dashboard panel containing:
	 * - Viewing existing comments bound to the current URL.
	 * - Highlighting exact elements on the page (by CSS Selector) using Crosshairs.
	 * - Real-time bulk JSON Import/Export right out of the box.
	 */
	it('How to open the Comments Dashboard?', () => {
		//import { WebCommentAdapter } from '@nan0web/comment'
		const adapter = new WebCommentAdapter({
			db: { async loadAll() { return [] }, async save() {}, async clear() {}, async remove() {} },
			t: (k) => k
		})
		
		// Programmatically open the List Panel
		// adapter.showCommentList()
		
		assert.ok(adapter)
	})

	/**
	 * @docs
	 * ## Core Logic (CommentModel)
	 *
	 * Advanced use cases can directly interact with the `CommentModel` generator to bypass the Web adapter (e.g. for CLI tooling or Unit Tests).
	 */
	it('How to use CommentModel generator?', async () => {
		//import { CommentModel } from '@nan0web/comment/domain'
		const model = new CommentModel()
		
		assert.equal(typeof model.run, 'function')
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.', async () => {
		/** @docs */
		const text = fsNode.readFileSync('LICENSE', 'utf-8').trim()
		assert.ok(String(text).includes('ISC'))
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
		assert.ok(saved.includes('## License'), 'README was not generated')
	})
})
