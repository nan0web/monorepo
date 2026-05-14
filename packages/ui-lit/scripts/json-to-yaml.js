import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from '../../../ui-react-bootstrap/node_modules/js-yaml/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function run() {
	const jsonContent = await fs.readFile(path.join(root, 'data/play/components.json'), 'utf-8')
	const data = JSON.parse(jsonContent)

	const yamlData = yaml.dump(data, { lineWidth: -1 })

	await fs.writeFile(
		path.join(root, 'data/play/index.yaml'),
		'# Sandbox Component Examples\n\n' + yamlData,
	)
	console.log('Successfully wrote data/play/index.yaml')
}
run()
