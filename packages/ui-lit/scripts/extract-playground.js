import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jsyaml from 'js-yaml' // Wait, I must use it if it's there. I'll just write JSON stringify then string replace, or construct YAML manually.

// I will construct the JS object, and then write JSON or simple YAML.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function run() {
	const html = await fs.readFile(path.join(root, 'e2e/playground.html'), 'utf-8')

	const docData = {
		groups: [],
	}

	const regexGroups =
		/<p class="text-muted text-uppercase small fw-bold mb-2[^>]*>(.*?)<\/p>\s*<ul class="nav flex-column gap-1[^>]*>([\s\S]*?)<\/ul>/g

	let match
	while ((match = regexGroups.exec(html)) !== null) {
		const groupTitle = match[1]
		const itemsHtml = match[2]

		const groupId = groupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')

		const group = {
			id: groupId,
			title: groupTitle,
			items: [],
		}

		const itemRegex = /href="#(block-[^"]+)"/g
		let itemMatch
		const blockIds = []
		while ((itemMatch = itemRegex.exec(itemsHtml)) !== null) {
			blockIds.push(itemMatch[1])
		}

		for (const blockId of blockIds) {
			const blockRegex = new RegExp(
				`<div id="${blockId}"[^>]*>[\\s\\S]*?<h2[^>]*>[^<]*?(?:📦\\s*)?([^<]*)<\\/h2>\\s*<p[^>]*>([^<]*)<\\/p>([\\s\\S]*?)<\\/div>\\s*<!-- ═══`,
			)
			const m = html.match(
				new RegExp(`<div id="${blockId}"[^>]*>([\\s\\S]*?)<\\/div>\\s*(?:<!--|$)`),
			)

			if (m) {
				const blockContent = m[1]
				const titleMatch = blockContent.match(/<h2[^>]*>(?:[^<]*?📦\s*)?([^<]+)<\/h2>/)
				const descMatch = blockContent.match(/<p[^>]*>([^<]+)<\/p>/)

				const item = {
					id: blockId,
					title: titleMatch ? titleMatch[1].trim() : '',
					desc: descMatch ? descMatch[1].trim() : '',
					examples: [],
				}

				const exRegex = /<e2e-example label="([^"]+)">([\s\S]*?)<\/e2e-example>/g
				let exMatch
				while ((exMatch = exRegex.exec(blockContent)) !== null) {
					const exLabel = exMatch[1]
					const exContent = exMatch[2]

					const previewMatch =
						exContent.match(/<([^>\s]+)[^>]*slot="preview"[^>]*>[\s\S]*?<\/\1>/) ||
						exContent.match(/<([^>\s]+)[\s\S]*slot="preview"[\s\S]*?<\/\1>/)
					let previewHtml = ''
					if (previewMatch) {
						previewHtml = exContent.replace(/<template[^>]*>[\s\S]*?<\/template>/g, '').trim()
						previewHtml = previewHtml.replace(/slot="preview"/g, '').trim()
					} else {
						// fallback regex
						const pMatch = exContent.split('<template')[0]
						previewHtml = pMatch.replace(/slot="preview"/g, '').trim()
					}

					const htmlCodeMatch = exContent.match(/<template slot="html-code">([\s\S]*?)<\/template>/)
					const yamlCodeMatch = exContent.match(/<template slot="yaml-code">([\s\S]*?)<\/template>/)

					item.examples.push({
						label: exLabel,
						previewHtml: previewHtml,
						codeHtml: htmlCodeMatch ? htmlCodeMatch[1].trim() : '',
						codeYaml: yamlCodeMatch ? yamlCodeMatch[1].trim() : '',
					})
				}

				group.items.push(item)
			}
		}

		docData.groups.push(group)
	}

	// Just output as JSON for simplicity, we can convert to YAML if needed or just use JSON.
	await fs.writeFile(path.join(root, 'data/play/components.json'), JSON.stringify(docData, null, 2))
	console.log('Done mapping components to data!')
}
run()
