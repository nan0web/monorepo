import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const pkgDir = process.cwd()

describe('Release v1.1.4: Package Hygiene & Migration', () => {
	describe('Documentation Integrity', () => {
		it('src/index.js should NOT have misleading fetch comment', () => {
			const content = fs.readFileSync(path.join(pkgDir, 'src/index.js'), 'utf8')
			assert.ok(!content.includes('Exporting mock fetch functionality'), 'index.js has stale comment')
		})

		it('docs/uk/README.md should be updated', () => {
			const content = fs.readFileSync(path.join(pkgDir, 'docs/uk/README.md'), 'utf8')
			assert.ok(content.includes('Happy DOM'), 'README.md missing Happy DOM')
			assert.ok(content.includes('Release Readiness Score'), 'README.md missing RRS')
		})
	})

	describe('File Migration (Regression)', () => {
		it('Legacy v1.0.0 tests should be in src/test/releases', () => {
			const regressionDir = path.join(pkgDir, 'src/test/releases/1/0/v1.0.0')
			assert.ok(fs.existsSync(regressionDir), 'Regression dir missing')
			const files = fs.readdirSync(regressionDir)
			assert.ok(files.includes('MemoryDB.test.js'), 'MemoryDB test missing from regression')
		})

		it('Original releases dir should be clean of tests', () => {
			const releaseDir = path.join(pkgDir, 'releases/1/0/v1.0.0')
			if (fs.existsSync(releaseDir)) {
				const files = fs.readdirSync(releaseDir)
				const testFiles = files.filter(f => f.endsWith('.test.js') || f.endsWith('.spec.js'))
				assert.equal(testFiles.length, 0, 'Tests still present in releases dir')
			}
		})
	})
})
