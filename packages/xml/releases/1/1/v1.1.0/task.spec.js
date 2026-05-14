import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import XMLTransformer from '../../../../src/Transformer.js'

describe('v1.1.0 — XMLTransformer.decode()', () => {
	const transformer = new XMLTransformer()

	it('decodes simple tag with text content', async () => {
		const result = await transformer.decode('<note>Hello</note>')
		assert.deepStrictEqual(result, { note: 'Hello' })
	})

	it('decodes tag with attributes', async () => {
		const result = await transformer.decode('<note id="1" type="info">Hello</note>')
		assert.deepStrictEqual(result, { note: 'Hello', $id: '1', $type: 'info' })
	})

	it('decodes self-closing tag', async () => {
		const result = await transformer.decode('<br />')
		assert.deepStrictEqual(result, { br: true })
	})

	it('decodes nested tags', async () => {
		const result = await transformer.decode('<root><child>A</child><other>B</other></root>')
		assert.deepStrictEqual(result, { root: { child: 'A', other: 'B' } })
	})

	it('decodes CDATA content', async () => {
		const result = await transformer.decode('<desc><![CDATA[Hello & World]]></desc>')
		assert.deepStrictEqual(result, { desc: 'Hello & World' })
	})

	it('decodes XML processing instruction', async () => {
		const result = await transformer.decode('<?xml version="1.0" encoding="UTF-8"?>')
		assert.deepStrictEqual(result, { '?xml': true, $version: '1.0', $encoding: 'UTF-8' })
	})

	it('decodes RSS feed structure with repeated items as array', async () => {
		const rss = `<rss version="2.0">
			<channel>
				<title>News</title>
				<item>
					<title>Article 1</title>
					<link>https://example.com/1</link>
				</item>
				<item>
					<title>Article 2</title>
					<link>https://example.com/2</link>
				</item>
			</channel>
		</rss>`
		const result = await transformer.decode(rss)
		assert.equal(result.rss.channel.title, 'News')
		assert.ok(Array.isArray(result.rss.channel.item))
		assert.equal(result.rss.channel.item.length, 2)
		assert.equal(result.rss.channel.item[0].title, 'Article 1')
		assert.equal(result.rss.channel.item[1].title, 'Article 2')
	})

	it('round-trip: encode → decode → encode produces same XML', async () => {
		const data = { note: { to: 'User', body: 'Hello' } }
		const xml = await transformer.encode(data)
		const decoded = await transformer.decode(xml)
		const reEncoded = await transformer.encode(decoded)
		assert.equal(xml, reEncoded)
	})

	it('unescapes XML entities', async () => {
		const result = await transformer.decode('<text>Hello &amp; &lt;World&gt;</text>')
		assert.deepStrictEqual(result, { text: 'Hello & <World>' })
	})

	it('decodes comment nodes', async () => {
		const result = await transformer.decode('<!-- This is a comment -->')
		assert.deepStrictEqual(result, { '#comment': 'This is a comment' })
	})

	it('decodes self-closing tag without space before slash', async () => {
		const result = await transformer.decode('<hr/>')
		assert.deepStrictEqual(result, { hr: true })
	})

	it('decodes tag with empty content', async () => {
		const result = await transformer.decode('<div></div>')
		assert.deepStrictEqual(result, { div: '' })
	})

	it('handles mixed text and entity unescaping', async () => {
		const result = await transformer.decode('<p>Price: 5 &lt; 10 &amp; 10 &gt; 5</p>')
		assert.deepStrictEqual(result, { p: 'Price: 5 < 10 & 10 > 5' })
	})
})
