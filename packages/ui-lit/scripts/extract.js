import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Window } from 'happy-dom'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function run() {
	const html = await fs.readFile(path.join(root, 'e2e/playground.html'), 'utf-8')
	const window = new Window({ url: 'http://localhost' })
	const document = window.document
	document.write(html)

	const sidebarNav = document.querySelectorAll('.nav.flex-column')
	const sections = []

	for (const nav of sidebarNav) {
		const groupNameEl = nav.previousElementSibling
		const groupTitle = groupNameEl ? groupNameEl.textContent.trim() : 'Uncategorized'
		const section = { title: groupTitle, items: [] }

		for (const link of nav.querySelectorAll('a.nav-link')) {
			const id = link.getAttribute('href').replace('#', '')
			const block = document.getElementById(id)
			if (!block) continue

			const titleEl = block.querySelector('h2')
			const descEl = block.querySelector('p')

			const item = {
				id,
				title: titleEl ? titleEl.textContent.replace('📦', '').trim() : '',
				desc: descEl ? descEl.textContent.trim() : '',
				examples: [],
			}

			for (const example of block.querySelectorAll('e2e-example')) {
				const label = example.getAttribute('label') || ''

				let previewHtml = ''
				const slots = example.children
				for (const slot of slots) {
					if (slot.tagName.toLowerCase() === 'template') continue
					if (slot.getAttribute('slot') === 'preview') {
						const clone = slot.cloneNode(true)
						clone.removeAttribute('slot')
						previewHtml = clone.outerHTML
					}
				}

				const htmlCode = example.querySelector('template[slot="html-code"]')
				const yamlCode = example.querySelector('template[slot="yaml-code"]')

				item.examples.push({
					label,
					previewHtml: previewHtml.trim() || undefined,
					codeHtml: htmlCode ? htmlCode.innerHTML.trim() : undefined,
					codeYaml: yamlCode ? yamlCode.innerHTML.trim() : undefined,
				})
			}
			section.items.push(item)
		}
		sections.push(section)
	}

	// Convert exactly to YAML format
	let yamlContent = `title: "Каталог OLMUI"\nsubtitle: "@nan0web/ui-lit"\nsections:\n`

	for (const section of sections) {
		yamlContent += `  - title: "${section.title}"\n    items:\n`
		for (const item of section.items) {
			yamlContent += `      - id: "${item.id}"\n`
			yamlContent += `        title: "${item.title}"\n`
			yamlContent += `        desc: "${item.desc}"\n`
			yamlContent += `        examples:\n`
			for (const ex of item.examples) {
				const sanitizeYaml = (str) => {
					if (!str) return ''
					return (
						'|\n' +
						str
							.split('\n')
							.map((l) => '            ' + l)
							.join('\n')
					)
				}
				yamlContent += `          - label: "${ex.label}"\n`
				if (ex.previewHtml) {
					yamlContent += `            previewHtml: ${sanitizeYaml(ex.previewHtml)}\n`
				}
				if (ex.codeHtml) {
					yamlContent += `            codeHtml: ${sanitizeYaml(ex.codeHtml)}\n`
				}
				if (ex.codeYaml) {
					yamlContent += `            codeYaml: ${sanitizeYaml(ex.codeYaml)}\n`
				}
			}
		}
	}

	await fs.writeFile(path.join(root, 'data/play/index.yaml'), yamlContent)
	console.log('Successfully generated index.yaml!')
}

run().catch(console.error)
