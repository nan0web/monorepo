import { XMLTransformer } from '../src/index.js'

const transformer = new XMLTransformer({ tab: '  ', eol: '\n' })

/**
 * @param {import('@nan0web/log').default} console
 */
export async function run(console) {
	console.info('\n🔄 XML Decode Demo\n')

	// 1. Simple tag
	const simple = await transformer.decode('<note>Hello World</note>')
	console.info('1. Simple:', JSON.stringify(simple))

	// 2. Tag with attributes
	const attrs = await transformer.decode('<note id="1" type="info">Hello</note>')
	console.info('2. Attributes:', JSON.stringify(attrs))

	// 3. Self-closing tag
	const selfClose = await transformer.decode('<br />')
	console.info('3. Self-closing:', JSON.stringify(selfClose))

	// 4. Nested tags
	const nested = await transformer.decode('<root><child>A</child><other>B</other></root>')
	console.info('4. Nested:', JSON.stringify(nested))

	// 5. CDATA
	const cdata = await transformer.decode('<desc><![CDATA[Hello & <World>]]></desc>')
	console.info('5. CDATA:', JSON.stringify(cdata))

	// 6. RSS feed
	const rss = `<rss version="2.0">
		<channel>
			<title>News</title>
			<item><title>Article 1</title><link>https://example.com/1</link></item>
			<item><title>Article 2</title><link>https://example.com/2</link></item>
		</channel>
	</rss>`
	const feed = await transformer.decode(rss)
	console.info('6. RSS channel title:', feed.rss.channel.title)
	console.info('   RSS items:', JSON.stringify(feed.rss.channel.item))

	// 7. Round-trip
	console.info('\n🔁 Round-trip Demo\n')
	const data = { note: { to: 'User', body: 'Hello' } }
	const xml = await transformer.encode(data)
	const decoded = await transformer.decode(xml)
	const reEncoded = await transformer.encode(decoded)
	console.info('Original data:', JSON.stringify(data))
	console.info('Encoded XML:', xml.replace(/\n/g, '\\n').replace(/  /g, '→→'))
	console.info('Decoded back:', JSON.stringify(decoded))
	console.info('Round-trip OK:', xml === reEncoded ? '✅' : '❌')
}
