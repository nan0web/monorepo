import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { existsSync, writeFileSync, unlinkSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import main from './release.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const tempDir = resolve(__dirname, 'temp')
const tempPackageJson = resolve(tempDir, 'package.json')

const fs = new FS()

describe('release.js', async () => {
	await fs.connect()
	const tempDir = 'tmp/release'
	const db = fs.extract(tempDir)
	await db.writeDocument('package.json', {
		name: 'test-package',
		version: '0.0.1-test',
	})

	// Mock process.cwd to return tempDir
	const originalCwd = process.cwd
	process.cwd = () => tempDir

	it('main function processes release command', async () => {
		// Test with ignore flags to avoid actual git operations
		const result = await main(['--ignore-uncommitted', '--ignore-fail-tests', '--ignore-tag'])
		assert.ok(result.includes('Release completed'))
	})

	it('main function processes prepare command', async () => {
		const resultP = await main(['prepare'])
		assert.ok(result.includes('Prepare completed'))
	})

	it('ReleaseCommand handles package.json validation', async () => {
		// Create a package.json without required scripts
		writeFileSync(
			tempPackageJson,
			JSON.stringify({
				name: 'test-package',
				version: '0.0.1-test',
			}),
		)

		// Should exit with error when missing scripts
		try {
			await main(['--ignore-uncommitted', '--ignore-fail-tests', '--ignore-tag'])
			assert.fail('Should have exited with error')
		} catch (err) {
			assert.ok(err.message.includes('Missing required scripts'))
		}

		// Should fix when --fix flag is used
		const result = await main([
			'--ignore-uncommitted',
			'--ignore-fail-tests',
			'--ignore-tag',
			'--fix',
		])
		assert.ok(result.includes('Release completed'))

		// Verify package.json was fixed
		const pkg = JSON.parse(readFileSync(tempPackageJson, 'utf8'))
		assert.ok(pkg.scripts.dev)
		assert.ok(pkg.scripts.build)
		assert.ok(pkg.scripts.preview)
		assert.ok(pkg.scripts.test)
		assert.ok(pkg.scripts.clean)
		assert.ok(pkg.devDependencies.husky)
	})

	// Cleanup
	process.cwd = originalCwd
	await db.dropDocument('package.json')
})
