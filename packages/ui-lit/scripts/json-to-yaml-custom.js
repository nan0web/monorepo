import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function run() {
	const jsonContent = await fs.readFile(path.join(root, 'data/play/components.json'), 'utf-8')
	const data = JSON.parse(jsonContent)

	let yamlContent = `title: Каталог OLMUI\nsubtitle: "@nan0web/ui-lit"\nsections:\n`

	for (const group of data.groups) {
		yamlContent += `  - title: "${group.title}"\n    items:\n`
		for (const item of group.items) {
			yamlContent += `      - id: "${item.id}"\n`
			yamlContent += `        title: "${item.title.replace(/"/g, '\\"')}"\n`
			yamlContent += `        desc: "${item.desc.replace(/"/g, '\\"')}"\n`
			yamlContent += `        examples:\n`
			if (item.examples) {
				for (const ex of item.examples) {
					yamlContent += `          - label: "${ex.label.replace(/"/g, '\\"')}"\n`

					const sanitizeYaml = (str) => {
						if (!str) return '""'

						// CLEAN OUT STRAGGLER <template> TAGS FROM PREVIEWHTML PARSING
						let cleanStr = str
						cleanStr = cleanStr.replace(/<template[^>]*>[\s\S]*?<\/template>/g, '')
						// also handle <template ...>...</template > split over lines:
						cleanStr = cleanStr.replace(
							/<template[^>]*>[\s\S]*?/g,
							function (match, offset, string) {
								// Just cut off at the first <template
								return ''
							},
						)

						cleanStr = cleanStr.trim()

						return (
							'|\n' +
							cleanStr
								.split('\n')
								.map((l) => '              ' + l)
								.join('\n')
						)
					}

					if (ex.previewHtml) {
						let preview = ex.previewHtml
						if (preview.indexOf('<template') !== -1) {
							preview = preview.substring(0, preview.indexOf('<template')).trim()
						}
						yamlContent += `            previewHtml: ${sanitizeYaml(preview)}\n`
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
	}

	await fs.writeFile(
		path.join(root, 'data/play/index.yaml'),
		'# Sandbox Component Examples\n\n' + yamlContent,
	)
	console.log('Successfully wrote data/play/index.yaml and stripped <template> aggressively')
}
run()
