import { describe, it } from 'node:test'
import assert from 'node:assert'
import Markdown from './Markdown.js'
import MDHeading1 from './MDHeading1.js'
import MDHeading2 from './MDHeading2.js'
import MDHeading3 from './MDHeading3.js'
import MDParagraph from './MDParagraph.js'
import MDOrderedList from './MDOrderedList.js'
import MDList from './MDList.js'
import MDListItem from './MDListItem.js'
import MDCodeBlock from './MDCodeBlock.js'
import MDCodeInline from './MDCodeInline.js'
import MDBlockquote from './MDBlockquote.js'
import MDHorizontalRule from './MDHorizontalRule.js'
import MDSpace from './MDSpace.js'

describe('Markdown', () => {
	it('should parse headings', () => {
		const md = new Markdown()
		const elements = md.parse('# Heading 1\n## Heading 2\n### Heading 3')
		assert.strictEqual(elements.length, 3)
		assert.ok(elements[0] instanceof MDHeading1)
		assert.strictEqual(elements[0].content, 'Heading 1')
		assert.ok(elements[1] instanceof MDHeading2)
		assert.ok(elements[2] instanceof MDHeading3)
	})

	it('should parse paragraphs', () => {
		const md = new Markdown()
		const elements = md.parse('This is a \nmultiline paragraph.\n\nAnother paragraph.')
		assert.strictEqual(elements.length, 2)
		assert.ok(elements[0] instanceof MDParagraph)
		assert.strictEqual(elements[0].content, 'This is a \nmultiline paragraph.')
		assert.ok(elements[1] instanceof MDParagraph)
		assert.strictEqual(elements[1].content, 'Another paragraph.')
	})

	it('should parse ordered list', () => {
		const md = new Markdown()
		const elements = md.parse('1. first\n2. second\n3. third')
		assert.strictEqual(elements.length, 1)
		const list = elements[0]
		assert.ok(list instanceof MDOrderedList)
		assert.strictEqual(list.ordered, true)
		assert.strictEqual(list.children.length, 3)
		assert.strictEqual(list.children[1].content, 'second')
	})

	it('should parse unordered list', () => {
		const md = new Markdown()
		const elements = md.parse('- item 1\n- item 2\n- item 3')
		assert.strictEqual(elements.length, 1)
		const list = elements[0]
		assert.ok(list instanceof MDList)
		assert.strictEqual(list.ordered, false)
		assert.strictEqual(list.children.length, 3)
		assert.strictEqual(list.children[0].content, 'item 1')
	})

	it('should parse code block', () => {
		const md = new Markdown()
		const input = "# JS code\n```js\nconsole.log('hi')\n```\nHello!\n\n"
		const elements = md.parse(input)
		assert.strictEqual(elements.length, 3)
		const code = elements[1]
		assert.ok(code instanceof MDCodeBlock)
		assert.strictEqual(code.language, 'js')
		assert.strictEqual(code.content, "console.log('hi')")
		assert.strictEqual(String(md.document), input)
	})

	it('should parse blockquote', () => {
		const md = new Markdown()
		const elements = md.parse('> quote line 1\n> quote line 2')
		assert.strictEqual(elements.length, 1)
		const bq = elements[0]
		assert.ok(bq instanceof MDBlockquote)
		assert.strictEqual(bq.content, 'quote line 1\nquote line 2')
	})

	it('should parse horizontal rule', () => {
		const md = new Markdown()
		const elements = md.parse('---')
		assert.strictEqual(elements.length, 1)
		assert.ok(elements[0] instanceof MDHorizontalRule)
	})

	it('should see paragraphs with spaces', () => {
		const elements = Markdown.parse(['Few rows', 'paragraph', '', ''].join('\n'))
		const expected = [new MDParagraph({ content: 'Few rows\nparagraph' })]
		assert.deepStrictEqual(elements, expected)
	})

	it('should stringify to html', () => {
		const md = new Markdown()
		md.parse('# Title\n\nParagraph\n\n1. first\n2. second\n\n```js\ncode\n```')
		const html = md.stringify()
		assert.ok(html.includes('<h1>Title</h1>'))
		assert.ok(html.includes('<p>Paragraph</p>'))
		assert.ok(html.includes('<ol>'))
		assert.ok(html.includes('<pre><code class="language-js">code</code></pre>'))
	})

	it('should allow interceptor in stringify', () => {
		const md = new Markdown()
		md.parse('# Title')
		const html = md.stringify(({ element }) => {
			if (element instanceof MDHeading1) {
				return `<h1 class="custom">${element.content}</h1>`
			}
			return null
		})
		assert.strictEqual(html, '<h1 class="custom">Title</h1>')
	})

	it('should allow interceptor in async stringify', async () => {
		const md = new Markdown()
		md.parse('# Title')
		const html = await md.asyncStringify(async ({ element }) => {
			if (element instanceof MDHeading1) {
				return `<h1 class="custom">${element.content}</h1>`
			}
			return null
		})
		assert.strictEqual(html, '<h1 class="custom">Title</h1>')
	})

	it('should properly parse new lines', () => {
		const input = [
			'Check this document:',
			'- [Index](index.txt)',
			'- [README.md](README.md)',
			'- [+**/*.test.js; -*/test.js](src/**/*.js)',
			'- [](package.json)',
		]
		const elements = Markdown.parse(input.join('\n'))
		assert.deepStrictEqual(elements.map(String), [
			'Check this document:\n\n',
			'- [Index](index.txt)\n' +
				'- [README.md](README.md)\n' +
				'- [+**/*.test.js; -*/test.js](src/**/*.js)\n' +
				'- [](package.json)\n\n',
		])
	})

	it('should properly parse inline code', () => {
		const input = [
			'`DB.path.test.js` is a test suite from the base `DB` class.',
			'I think it should be covered the same way.',
			'',
			'Your thoughts?',
			'',
			'#.',
		].join('\n')
		const elements = Markdown.parse(input)
		assert.strictEqual(elements.length, 3)
		assert.ok(elements[0] instanceof MDParagraph)
		assert.ok(elements[0].content.includes('DB.path.test.js'))
		assert.ok(elements[0].content.includes('DB'))
		assert.ok(elements[1] instanceof MDParagraph)
		assert.strictEqual(elements[1].content, 'Your thoughts?')
		assert.ok(elements[2] instanceof MDParagraph)
	})

	it('should properly stringify inline code within paragraphs', () => {
		const paragraph = new MDParagraph({
			content:
				'`DB.path.test.js` is a test suite from the base `DB` class.\nI think it should be covered the same way.',
		})
		const stringified = paragraph.toString()
		assert.ok(stringified.includes('`DB.path.test.js` is a test suite from the base `DB` class.'))
		assert.ok(stringified.includes('I think it should be covered the same way.'))
	})

	it('should properly parse and stringify complex inline elements', () => {
		const input = 'This paragraph contains `inline code` and also [links](https://example.com).'
		const elements = Markdown.parse(input)
		assert.strictEqual(elements.length, 1)
		assert.ok(elements[0] instanceof MDParagraph)
		const output = elements[0].toString()
		assert.ok(output.includes('`inline code`'))
	})

	it('should properly parse paragraphs with no spaces', () => {
		const input = [
			'This is a paragraph with double new line ending',
			'',
			'',
			'This is a second paragraph',
			'',
			'',
			'3rd is without So in resut it is p + p + p',
		]
		const elements = Markdown.parse(input.join('\n'))
		assert.deepStrictEqual(elements, [
			new MDParagraph({ content: input[0] }),
			new MDParagraph({ content: input[3] }),
			new MDParagraph({ content: input[6] }),
		])
	})
})
