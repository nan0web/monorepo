import fs from 'node:fs'
import path from 'node:path'

const packagesDir = '/Users/i/src/nan.web/packages'
const dirs = fs.readdirSync(packagesDir)

for (const dir of dirs) {
	const tsconfigPath = path.join(packagesDir, dir, 'tsconfig.json')
	if (!fs.existsSync(tsconfigPath)) continue

	console.log(`Updating ${tsconfigPath}...`)
	const raw = fs.readFileSync(tsconfigPath, 'utf8')
	let config
	try {
		// Safely parse JSON with comments & trailing commas using eval wrapper
		config = eval('(' + raw + ')')
	} catch (e) {
		console.error(`Failed to parse ${tsconfigPath}:`, e)
		continue
	}

	if (!config.compilerOptions) {
		config.compilerOptions = {}
	}

	config.compilerOptions.baseUrl = '.'
	config.compilerOptions.paths = {
		'@nan0web/*': [
			'../*/types',
			'../*/types/index.d.ts',
			'../*/types/index.js'
		]
	}

	fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, '\t') + '\n', 'utf8')
}
console.log('All tsconfig.json files successfully updated with isolated paths mappings!')
