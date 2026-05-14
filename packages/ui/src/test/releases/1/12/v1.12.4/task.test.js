import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

describe('v1.12.4: Changelog Integrity & Model Export Verification', () => {
	const rootDir = path.resolve(import.meta.dirname, '../../../../')
	const changelogPath = path.join(rootDir, 'CHANGELOG.md')
	const packageJsonPath = path.join(rootDir, 'package.json')

	it('should have 1.12.2 entry in CHANGELOG.md', () => {
		const content = fs.readFileSync(changelogPath, 'utf8')
		assert.ok(content.includes('## [1.12.2]'), 'CHANGELOG.md should contain version 1.12.2')
		assert.ok(content.includes('SpecRunner.executeFile'), 'CHANGELOG.md should describe 1.12.2 features')
	})

	it('should have correct exports in package.json', () => {
		const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
		assert.ok(pkg.exports['./models'], 'package.json should export ./models')
		assert.strictEqual(pkg.exports['./models'].import, './src/Model/index.js', 'Model export path should be correct')
	})

	it('should be able to import models from the index', async () => {
		const modelIndexPath = path.join(rootDir, 'src/Model/index.js')
		const models = await import(`file://${modelIndexPath}`)
		
		assert.ok(models.HeaderModel, 'HeaderModel should be exported')
		assert.ok(models.ButtonModel, 'ButtonModel should be exported')
		assert.ok(models.default.HeaderModel, 'HeaderModel should be in default export object')
	})

	it('should have valid links in root README.md', () => {
		const readmePath = path.join(rootDir, 'README.md')
		const content = fs.readFileSync(readmePath, 'utf8')
		
		// Simple check for some key links
		const links = [
			'./docs/uk/README.md',
			'./docs/en/README.md'
		]
		
		for (const link of links) {
			const linkPath = path.join(rootDir, link)
			assert.ok(fs.existsSync(linkPath), `Link ${link} in README.md should point to an existing file`)
		}
	})
})
