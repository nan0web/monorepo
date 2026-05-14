#!/usr/bin/env node

/**
 * @param {import("@nan0web/log")} console
 */
export async function run(console) {
	console.clear()
	console.success('Atom Feed Example Demo')

	const { nano2xml, Case } = await import('../src/index.js')

	const atomData = [
		{
			$version: '1.0',
			$encoding: 'UTF-8',
			'?xml': true,
		},
		{
			$xmlns: 'http://www.w3.org/2005/Atom',
			feed: {
				title: 'Nan0web Blog',
				link: [{ $href: 'https://yaro.page', $rel: 'self' }, { $href: 'https://yaro.page/blog' }],
				updated: '2024-12-28T10:50:59+00:00',
				id: 'tag:yaro.page,2024:/blog',
				author: {
					name: 'ЯRаСлав',
				},
				entry: [
					{
						title: 'First Post',
						link: { $href: 'https://yaro.page/post/1' },
						id: 'post-1',
						updated: '2024-12-28T10:50:59+00:00',
						content: 'This is the first blog post.',
					},
					{
						title: 'Second Post',
						link: { $href: 'https://yaro.page/post/2' },
						id: 'post-2',
						updated: '2024-12-27T09:30:00+00:00',
						content: 'This is another example post.',
					},
				],
			},
		},
	]

	const xml = nano2xml(atomData, {
		indent: '\t',
		newLine: '\n',
		defaultTags: {
			$attrCase: Case.KEBAB,
			feed: 'feed',
			entry: 'entry',
		},
	})

	console.info('Generated Atom Feed:\n')
	console.info(xml)

	console.success('\nAtom feed demo complete! 📡')
}
