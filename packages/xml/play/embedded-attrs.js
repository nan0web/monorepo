#!/usr/bin/env node

/**
 * @param {import("@nan0web/log")} console
 */
export async function run(console) {
	console.clear()
	console.success('Embedded Attributes Demo')

	const { nano2xml } = await import('../src/index.js')

	const data = {
		'div.header#main': {
			'span.title': 'Welcome to Nan0web',
			'nav.menu': {
				'a.link#home.nav-item': 'Home',
				'a.link#about.nav-item': 'About',
				'a.link#contact.nav-item': 'Contact',
			},
		},
		'article.content': {
			'h1#title': 'Article Title',
			'p.lead': 'This is the leading paragraph.',
			p: 'This is a regular paragraph.',
			'img#featured.main-image': { $src: 'featured.jpg', $alt: 'Featured Image' },
		},
		'footer#bottom': '© 2024 Nan0web. All rights reserved.',
	}

	const xml = nano2xml(data, {
		indent: '\t',
		newLine: '\n',
		defaultTags: {
			$tagAttrs: { '#': 'id', '.': 'class' },
		},
	})

	console.info('Generated XML with embedded attributes:\n')
	console.info(xml)

	console.success('\nEmbedded attributes demo complete! 🏷️')
}
