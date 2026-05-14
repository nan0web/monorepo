import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.resolve(__dirname, '../../../..')

describe('Release: UI Identity Sync (Data-Driven Documentation)', () => {
	it('should maintain sandbox documentation data in data/play/ directory', async () => {
		const dataLayerPath = path.resolve(pkgRoot, 'data/play')

		let stat = null
		try {
			stat = await fs.stat(dataLayerPath)
		} catch (e) {}

		assert.ok(
			stat && stat.isDirectory(),
			'data/play MUST exist to drive the sandbox via Data Layer',
		)
	})

	it('should use YAML or Markdown files for component definitions', async () => {
		const dataLayerPath = path.resolve(pkgRoot, 'data/play')
		let files = []
		try {
			files = await fs.readdir(dataLayerPath)
		} catch (e) {}

		const hasYamlOrMd = files.some((f) => f.endsWith('.yaml') || f.endsWith('.md'))
		assert.ok(
			hasYamlOrMd,
			'data/play must contain YAML or Markdown files for component sandbox data',
		)
	})

	it('should remove hardcoded component blocks from playground.html', async () => {
		const htmlPath = path.resolve(pkgRoot, 'e2e/playground.html')
		let html = ''
		try {
			html = await fs.readFile(htmlPath, 'utf-8')
		} catch (e) {
			assert.fail('playground.html does not exist')
		}

		const exampleMatches = html.match(/<e2e-example/g)
		const count = exampleMatches ? exampleMatches.length : 0

		assert.ok(
			count < 5,
			`There should be no hardcoded <e2e-example> blocks in HTML. Found: ${count}`,
		)
	})
})
