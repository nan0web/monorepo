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

	const paths = {}
	for (const other of dirs) {
		if (other === dir) continue
		const otherTsconfig = path.join(packagesDir, other, 'tsconfig.json')
		if (!fs.existsSync(otherTsconfig)) continue

		paths[`@nan0web/${other}`] = [
			`../${other}/types`,
			`../${other}/types/index.d.ts`,
			`../${other}/types/index.js`
		]
		paths[`@nan0web/${other}/oop`] = [
			`../${other}/types/oop.d.ts`,
			`../${other}/types/oop.js`
		]
		paths[`@nan0web/${other}/command`] = [
			`../${other}/types/command.d.ts`,
			`../${other}/types/command.js`
		]
		paths[`@nan0web/${other}/types`] = [
			`../${other}/types/types/index.d.ts`,
			`../${other}/types/types/index.js`
		]
		paths[`@nan0web/${other}/core`] = [
			`../${other}/types/core/index.d.ts`,
			`../${other}/types/core/index.js`
		]
		paths[`@nan0web/${other}/components`] = [
			`../${other}/types/Component/index.d.ts`,
			`../${other}/types/Component/index.js`
		]
		paths[`@nan0web/${other}/domain`] = [
			`../${other}/types/domain/index.d.ts`,
			`../${other}/types/domain/index.js`
		]
		paths[`@nan0web/${other}/models`] = [
			`../${other}/types/Model/index.d.ts`,
			`../${other}/types/Model/index.js`
		]
		paths[`@nan0web/${other}/inspect`] = [
			`../${other}/types/inspect.d.ts`,
			`../${other}/types/inspect.js`
		]
		paths[`@nan0web/${other}/testing`] = [
			`../${other}/types/testing/index.d.ts`,
			`../${other}/types/testing/index.js`
		]
		paths[`@nan0web/${other}/builder`] = [
			`../${other}/types/domain/StoreBuilderApp.d.ts`,
			`../${other}/types/domain/StoreBuilderApp.js`
		]
	}

	config.compilerOptions.paths = paths

	fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, '\t') + '\n', 'utf8')
}
console.log('All tsconfig.json files successfully updated with isolated paths mappings!')
