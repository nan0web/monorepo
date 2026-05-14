import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import HTMLTransformer from './Transformer.js'

describe('HTMLTransformer', () => {
	let transformer

	beforeEach(() => {
		transformer = new HTMLTransformer()
	})

	it('should encode nano object to HTML', async () => {
		const nanoData = {
			div: {
				h1: 'Hello World',
				p: 'This is a paragraph',
			},
		}

		const expectedHTML = `
<div>
	<h1>Hello World</h1>
	<p>This is a paragraph</p>
</div>`.trim()

		const result = await transformer.encode(nanoData)
		assert.equal(result, expectedHTML)
	})

	it('should throw error when trying to decode HTML', async () => {
		const htmlString = '<div><h1>Hello World</h1></div>'

		await assert.rejects(
			() => transformer.decode(htmlString),
			/HTMLTransformer\.decode\(\) is not implemented yet/,
		)
	})

	it('should render proper html', async () => {
		const data = [
			{ '!DOCTYPE': true, $html: true },
			{
				$lang: 'en',
				html: [
					{
						head: [
							{ meta: true, $charset: 'UTF-8' },
							{ meta: true, $name: 'viewport', $content: 'width=device-width, initial-scale=1.0' },
							{ title: '<Escaped Title>' },
							{
								$href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
								$rel: 'stylesheet',
								link: true,
							},
							{ style: true },
							{ script: true, $src: 'index.js' },
							{ script: 'console.log(this)' },
						],
					},
					{
						body: [
							{
								$id: 'app',
								main: [
									{ '#Bootstrap JS': '5.3.3' },
									{
										script: true,
										$src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
									},
								],
							},
						],
					},
				],
			},
		]

		const html =
			`<!DOCTYPE html>\n` +
			`<html lang="en">\n\t` +
			`<head>\n\t\t` +
			`<meta charset="UTF-8">\n\t\t` +
			`<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t\t` +
			`<title>&lt;Escaped Title&gt;</title>\n\t\t` +
			`<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n\t\t` +
			`<style></style>\n\t\t` +
			`<script src="index.js"></script>\n\t\t` +
			`<script>console.log(this)</script>\n\t` +
			`</head>\n\t` +
			`<body>\n\t\t` +
			`<main id="app">\n\t\t\t` +
			`<!-- Bootstrap JS: 5.3.3 -->\n\t\t\t` +
			`<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n\t\t` +
			`</main>\n\t` +
			`</body>\n` +
			`</html>`

		const tr = new HTMLTransformer()
		const result = await tr.encode(data)
		assert.equal(result, html)
	})

	it('should render proper html attributes defined in tags: div.d-flex#main > a.btn', async () => {
		const data = [
			{
				'div.d-flex#main': [
					{ 'a.btn.btn-primary': 'Button' },
					{ 'a#more': 'More' },
					{ 'a.btn#detail.btn-success': 'Detail' },
				],
			},
		]
		const expected =
			'<div id="main" class="d-flex">' +
			'<a class="btn btn-primary">Button</a>' +
			'<a id="more">More</a>' +
			'<a id="detail" class="btn btn-success">Detail</a>' +
			'</div>'
		const tr = new HTMLTransformer({ eol: '', tab: '' })
		const result = await tr.encode(data)
		assert.equal(result, expected)
	})

	it('should properly renders ol > li with their classes', async () => {
		const data = [
			{ h1: 'Heading <h1>' },
			{ p: 'Paragraph' },
			{ h2: 'Heading <h2>' },
			{
				$class: 'list-group',
				ol: [
					{ $class: 'list-group-item', li: 'List item 1' },
					{ $class: 'list-group-item', li: 'List item 2' },
				],
			},
			{ h3: 'Heading <h3>' },
			{
				p: [
					'Paragraph with the link ',
					{ $href: '/index.html', a: 'Go home' },
					' you can click to go home',
				],
			},
		]
		const tr = new HTMLTransformer({ eol: '', tab: '' })
		const html = await tr.encode(data)
		assert.ok(html.includes('<h1>Heading &lt;h1&gt;</h1>'))
		assert.ok(html.includes('<li class="list-group-item">List item 1</li>'))
		assert.ok(!html.includes('<li><li class="list-group-item"'))
		assert.ok(html.includes('Paragraph with the link '))
		assert.ok(html.includes('<a href="/index.html">Go home</a> you can click to go home'))
	})

	it('should properly render ul > "text"', async () => {
		const data = [
			{
				ul: ['List item 1', 'List item 2'],
			},
		]
		const tr = new HTMLTransformer({ eol: '', tab: '' })
		const html = await tr.encode(data)
		assert.ok(html.includes('<ul><li>List item 1</li><li>List item 2</li></ul>'))
	})
})
