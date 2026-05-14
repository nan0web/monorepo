import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import { HTMLTransformer, HTMLTags, defaultHTML5Tags, escape } from './index.js'

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
 * Core suite that doubles as source for the final README.md.
 *
 * Each `it` block contains a `@docs` comment that will be extracted
 * by DocsParser to generate the documentation.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/html
	 *
	 * HTML utilities for nan0web ecosystem.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/html
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/html')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/html
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/html')
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/html
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/html')
	})

	/**
	 * @docs
	 * ## Basic usage – encode nano to HTML
	 */
	it('How to encode a simple nano object?', async () => {
		//import { HTMLTransformer } from "@nan0web/html"
		const transformer = new HTMLTransformer({ eol: '\n', tab: '\t' })
		const nano = {
			div: {
				h1: 'Hello World',
				p: 'This is a paragraph',
			},
		}
		const result = await transformer.encode(nano)
		console.info(result)
		// <div>\n\t<h1>Hello World</h1>\n\t<p>This is a paragraph</p>\n</div>
		assert.equal(
			console.output()[0][1],
			'<div>\n\t<h1>Hello World</h1>\n\t<p>This is a paragraph</p>\n</div>',
		)
	})

	/**
	 * @docs
	 * ## Tag attributes – class and id shortcuts
	 */
	it('How to render elements with class and id shortcuts?', async () => {
		//import { HTMLTransformer } from "@nan0web/html"
		const data = [
			{
				'div.d-flex#main': [
					{ 'a.btn.btn-primary': 'Button' },
					{ 'a#more': 'More' },
					{ 'a.btn#detail.btn-success': 'Detail' },
				],
			},
		]
		const transformer = new HTMLTransformer({ eol: '', tab: '' })
		const result = await transformer.encode(data)
		console.info(result)
		// <div id="main" class="d-flex"><a class="btn btn-primary">Button</a><a id="more">More</a><a id="detail" class="btn btn-success">Detail</a></div>
		assert.equal(
			console.output()[0][1],
			'<div id="main" class="d-flex"><a class="btn btn-primary">Button</a><a id="more">More</a><a id="detail" class="btn btn-success">Detail</a></div>',
		)
	})

	/**
	 * @docs
	 * ## Lists – ordered and unordered
	 */
	it('How to render ordered list with classes?', async () => {
		//import { HTMLTransformer } from "@nan0web/html"
		const data = [
			{
				$class: 'list-group',
				ol: [
					{ $class: 'list-group-item', li: 'Item 1' },
					{ $class: 'list-group-item', li: 'Item 2' },
				],
			},
		]
		const transformer = new HTMLTransformer({ eol: '', tab: '' })
		const html = await transformer.encode(data)
		console.info(html)
		// <ol class="list-group"><li class="list-group-item">Item 1</li><li class="list-group-item">Item 2</li></ol>
		assert.equal(
			console.output()[0][1],
			'<ol class="list-group"><li class="list-group-item">Item 1</li><li class="list-group-item">Item 2</li></ol>',
		)
	})

	/**
	 * @docs
	 * ## Raw HTML escaping
	 *
	 * The `escape` helper from `@nan0web/xml` can be used to safely
	 * embed text that contains characters with special meaning in HTML.
	 */
	it('How to escape raw HTML strings?', () => {
		//import { escape } from "@nan0web/html"
		const raw = "<script>alert('xss')</script>"
		const escaped = escape(raw)
		// &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;
		assert.equal(escaped, '&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;')
	})

	/**
	 * @docs
	 * ## Default HTML5 tags reference
	 *
	 * `defaultHTML5Tags` provides a ready‑to‑use instance of `HTMLTags`
	 * with common defaults (e.g. `$default = 'p'`, `$selfClosed` handling, …).
	 */
	it('How to access default HTML5 tag definitions?', () => {
		//import { defaultHTML5Tags } from "@nan0web/html"
		console.info(defaultHTML5Tags)
		// HTMLTags {
		//   '$attrTrue': '',
		//   '$default': 'p',
		//   '$nonEmptyTags': [
		//     'script',
		//     'style'
		//   ],
		//   '$singleChild': [
		//     'tbody'
		//   ],
		//   '$tagAttrs': {
		//     '#': 'id',
		//     '.': 'class'
		//   },
		//   dl: 'dt',
		//   ol: 'li',
		//   select: 'option',
		//   table: 'tr',
		//   tr: 'td',
		//   ul: 'li'
		// }
		assert.equal(console.output()[0][1], defaultHTML5Tags)
	})

	/**
	 * @docs
	 * ## TypeScript declarations
	 *
	 * The package ships with declaration files for a better editor experience.
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, './types/index.d.ts')
	})

	/**
	 * @docs
	 * ## CLI playground
	 *
	 * Run the bundled playground script to see a live demo.
	 */
	it('How to run the playground script?', async () => {
		assert.ok(String(pkg.scripts?.play))
		const response = await runSpawn('node', ['play/main.js'])
		assert.equal(response.code, 0)
		assert.ok(response.text.includes('HTML Playground Demo'))
	})

	/**
	 * @docs
	 * ## Contributing
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
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		assert.ok(String(await fs.loadDocument('LICENSE')).includes('ISC'))
	})

	it('All public symbols should be exported', () => {
		assert.ok(HTMLTransformer)
		assert.ok(HTMLTags)
		assert.ok(defaultHTML5Tags)
		assert.ok(escape)
	})
}

/* -------------------------------------------------------------------------- */
/* Rendering phases – executed by the test runner, not by end users          */
/* -------------------------------------------------------------------------- */
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
		const rendered = await fs.loadDocument('README.md')
		assert.ok(rendered.includes('## Installation'))
	})
})
