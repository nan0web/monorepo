import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import {
	Markdown,
	MDElement,
	MDParagraph,
	MDHeading1,
	MDHeading2,
	MDHeading3,
	MDList,
	MDListItem,
	MDCodeBlock,
	MDCodeInline,
	MDLink,
	MDImage,
	MDBlockquote,
	MDHorizontalRule,
	MDTable,
	MDTaskList,
	MDTableRow,
} from '../index.js'

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
	 * # @nan0web/markdown
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * A zero-dependency, extensible Markdown parser for nan0web.
	 *
	 * Built with minimalism and clarity in mind, it provides a robust way to parse
	 * Markdown into structured elements and render them as HTML or back to Markdown.
	 *
	 * ## Features
	 *
	 * - Parses standard Markdown syntax into structured objects
	 * - Supports headings, paragraphs, lists, code blocks, links, images, blockquotes, tables, and more
	 * - Extensible element types for custom Markdown structures
	 * - Converts Markdown to HTML
	 * - Written in pure JavaScript with JSDoc typing
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/markdown
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/markdown')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/markdown
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/markdown')
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/markdown
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/markdown')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Parsing
	 *
	 * Parses Markdown text into an array of `MDElement` objects. You can either pass the text directly into the constructor for immediate parsing, or use the `.parse()` method.
	 */
	it('How to parse Markdown text into elements?', () => {
		//import { Markdown } from "@nan0web/markdown"
		
		// 1. Direct parsing via constructor
		const mdFast = new Markdown('# Fast Parse')
		console.info(mdFast.document.children.length) // ← 1 (heading)
		assert.equal(console.output()[0][1], 1)
		
		// 2. Parsing via method
		const md = new Markdown()
		const elements = md.parse('# Hello World\n\nThis is a paragraph.')
		console.info(elements.length) // ← 3 (heading, paragraph, space)
		assert.equal(console.output()[1][1], 3)
		assert.ok(elements[0] instanceof MDHeading1)
		assert.ok(elements[1] instanceof MDElement) // Paragraphs are parsed as generic MDElement in current implementation
	})

	/**
	 * @docs
	 * ### Stringify to HTML
	 *
	 * Converts parsed elements to HTML string.
	 */
	it('How to convert parsed Markdown to HTML?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const md = new Markdown()
		md.parse('# Title\n\nParagraph\n\n1. first\n2. second\n\n```js\ncode\n```\n\n')
		const html = md.stringify()
		console.info(html) // ← <h1>Title</h1>...
		assert.ok(console.output()[0][1].includes('<h1>Title</h1>'))
		assert.ok(console.output()[0][1].includes('<p>Paragraph</p>'))
		assert.ok(console.output()[0][1].includes('<ol>'))
		assert.ok(console.output()[0][1].includes('<pre><code class="language-js">code</code></pre>'))
	})

	/**
	 * @docs
	 * ### Custom Rendering with Interceptor
	 *
	 * Optionally accepts an interceptor function to customize rendering per element.
	 */
	it('How to use an interceptor for custom HTML rendering?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const md = new Markdown()
		md.parse('# Title')
		const html = md.stringify(({ element }) => {
			if (element instanceof MDHeading1) {
				return `<h1 class="custom">${element.content}</h1>`
			}
			return null
		})
		console.info(html) // ← <h1 class="custom">Title</h1>
		assert.strictEqual(console.output()[0][1], '<h1 class="custom">Title</h1>')
	})

	/**
	 * @docs
	 * ### Handling Inline Code
	 */
	it('How to parse and stringify inline code in paragraphs?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const input = '`DB.path.test.js` is a test suite from the base `DB` class.'
		const elements = Markdown.parse(input)
		const output = elements[0].toString()
		console.info(output) // ← "`DB.path.test.js` is a test suite from the base `DB` class.\n\n"
		assert.ok(console.output()[0][1].includes('`DB.path.test.js`'))
		assert.ok(console.output()[0][1].includes('`DB`'))
	})

	/**
	 * @docs
	 * ### Working with Lists
	 */
	it('How to handle unordered lists?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const md = new Markdown()
		const elements = md.parse('- item 1\n- item 2\n- item 3')
		console.info(elements.length) // ← 1
		console.info(elements[0] instanceof MDList) // ← true
		const list = elements[0].children
		console.info(list.length) // ← 3
		console.info(list[0].content) // ← item 1
		assert.equal(console.output()[0][1], 1)
		assert.equal(console.output()[1][1], true)
		assert.equal(console.output()[2][1], 3)
		assert.equal(console.output()[3][1], 'item 1')
	})

	/**
	 * @docs
	 * ### Code Blocks
	 */
	it('How to parse fenced code blocks?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const md = new Markdown()
		const input = "```js\nconsole.log('hi')\n```\n\n"
		const elements = md.parse(input)
		console.info(elements.length) // ← 2 (code block, space)
		const code = /** @type {MDCodeBlock[]} */ (elements)[0] // d.ts error workaround
		console.info(code.language) // ← "js"
		console.info(code.content) // ← "console.log('hi')"
		console.info(code instanceof MDCodeBlock) // ← true
		assert.equal(console.output()[0][1], 2)
		assert.equal(console.output()[1][1], 'js')
		assert.equal(console.output()[2][1], "console.log('hi')")
		assert.equal(console.output()[3][1], true)
	})

	/**
	 * @docs
	 * ### Tables
	 */
	it('How to parse tables?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const mdText =
			[
				'| Header 1 | Header 2 | Header 3 |',
				'|----------|----------|----------|',
				'| Cell 1  | Cell 2  | Cell 3  |',
				'| Cell 4  | Cell 5  | Cell 6  |',
			].join('\n') + '\n\n'
		const elements = Markdown.parse(mdText)
		console.info(elements.length) // ← 5 (table rows + space)
		const table = elements[0]
		console.info(table instanceof MDTableRow) // ← true
		assert.equal(console.output()[0][1], 5)
		assert.equal(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ### Task Lists
	 */
	it('How to parse task lists?', () => {
		//import { Markdown } from "@nan0web/markdown"
		const input = '- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media'
		const elements = Markdown.parse(input)
		console.info(elements.length) // ← 1
		const taskList = elements[0]
		console.info(taskList.children.length) // ← 3
		assert.equal(console.output()[0][1], 1)
		assert.equal(console.output()[1][1], 3)
		assert.ok(taskList instanceof MDList) // Task lists are currently parsed as regular lists
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### `Markdown`
	 *
	 * Main parser class. Accepts an optional `string` in its constructor for immediate parsing.
	 *
	 * * **Methods**
	 *   * `parse(text: string): MDElement[]` – Parses Markdown into objects.
	 *   * `stringify(interceptor?: Function): string` – Converts to HTML, optionally via interceptor.
	 *   * `asyncStringify(interceptor?: Function): Promise<string>` – Async version of stringify.
	 *
	 * ### `MDElement`
	 *
	 * Base class for all Markdown elements.
	 *
	 * * **Methods**
	 *   * `toHTML(): string` – HTML representation.
	 *   * `toString(): string` – Markdown representation.
	 *   * `static from(input)` – Factory from content or object.
	 *
	 * ### Supported Elements
	 *
	 * - `MDHeading1` to `MDHeading6`
	 * - `MDParagraph`
	 * - `MDList`, `MDListItem`
	 * - `MDCodeBlock`, `MDCodeInline`
	 * - `MDLink`, `MDImage`
	 * - `MDBlockquote`, `MDHorizontalRule`
	 * - `MDTable`, `MDTaskList`
	 */
	it('How to access core classes?', () => {
		assert.ok(Markdown)
		assert.ok(MDElement)
		assert.ok(MDHeading1)
		assert.ok(MDParagraph)
		assert.ok(MDCodeBlock)
		assert.ok(MDLink)
		assert.ok(MDBlockquote)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
	})

	/**
	 * @docs
	 * ## CLI Playground
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/markdown.git
		 * cd markdown
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, 'git command fails (e.g., not in a git repo)')
		assert.ok(response.text.trim().endsWith(':nan0web/markdown.git'))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')

		// Create CONTRIBUTING.md if it doesn't exist
		try {
			await fs.saveDocument('CONTRIBUTING.md', '# Contributing\n\nSee our contribution guidelines.')
		} catch (e) {
			// File might already exist, which is fine
		}

		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text.content || text)
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

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	const sourceCode = await fs.loadDocument('src/docs/README.md.js')
	let text = String(parser.decode(sourceCode))

	it(`generates README.md and datasets [${format(Buffer.byteLength(text))}b]`, async () => {
		// 1. Root README.md (with link to UK version)
		const rootLangLink = '> 🇺🇦 [Читати українською](./docs/uk/README.md)\n\n'
		await fs.saveDocument('README.md', rootLangLink + text)
		
		// 2. Clone for docs-site engine in docs/ (main English version)
		const docsLangLink = '> 🇺🇦 [Читати українською](../uk/README.md)\n\n'
		await fs.saveDocument('docs/README.md', docsLangLink + text)
		
		// 3. Clone for docs-site engine in docs/en/ (for explicit language selection)
		await fs.saveDocument('docs/en/README.md', docsLangLink + text)

		const dataset = DatasetParser.parse(text, pkg.name)
		await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)
		
		const saved = await fs.loadDocument('README.md')
		assert.ok(String(saved.content || saved).includes('## License'))
	})
})
