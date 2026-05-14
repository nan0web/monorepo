#!/usr/bin/env node

/**
 * @param {import("@nan0web/log")} console
 */
export async function run(console) {
	console.clear()
	console.success('Self-Closed Tags Demo')

	const { nano2xml } = await import('../src/index.js')

	const data = {
		container: [
			{ img: true, $src: 'image1.png', $alt: 'First image' },
			{ img: true, $src: 'image2.png', $alt: 'Second image' },
			{ input: true, $type: 'text', $name: 'username' },
			{ input: true, $type: 'password', $name: 'password' },
			{ br: true },
			{ br: true },
			{ hr: true },
		],
	}

	const xml = nano2xml(data, {
		indent: '\t',
		newLine: '\n',
		defaultTags: {
			$selfClosed: (tag) => ['img', 'input', 'br', 'hr'].includes(tag),
		},
	})

	console.info('Generated XML with self-closed tags:\n')
	console.info(xml)

	console.success('\nSelf-closed tags demo complete! 🔚')
}
