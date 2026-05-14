#!/usr/bin/env node

/**
 * @param {import("@nan0web/log")} console
 */
export async function run(console) {
	console.clear()
	console.success('Simple XML Rendering Demo')

	const { nano2xml } = await import('../src/index.js')

	const data = {
		$version: '1.0',
		$encoding: 'UTF-8',
		'?xml': true,
		note: {
			$id: '123',
			$priority: 'high',
			subject: 'Hello World',
			body: 'This is a simple XML example.',
			tags: ['nan0web', 'xml', 'demo'],
		},
	}

	const xml = nano2xml(data, {
		indent: '\t',
		newLine: '\n',
	})

	console.info('Generated XML:\n')
	console.info(xml)

	console.success('\nSimple XML rendering demo complete! 📄')
}
