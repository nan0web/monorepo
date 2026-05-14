import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import Scanner from './Scanner.js'

const TMP = join(tmpdir(), 'nan0release-scanner-test-' + Date.now())

describe('Scanner', () => {
	beforeEach(() => {
		mkdirSync(TMP, { recursive: true })
	})

	afterEach(() => {
		rmSync(TMP, { recursive: true, force: true })
	})

	describe('nested version structure', () => {
		it('finds spec files in nested directories (releases/1/0/v1.0.0/)', () => {
			const dir = join(TMP, 'releases/1/0/v1.0.0')
			mkdirSync(dir, { recursive: true })
			writeFileSync(join(dir, 'task.spec.js'), '// spec')

			const scanner = new Scanner(TMP)
			const specs = scanner.findSpecs()

			assert.equal(specs.length, 1)
			assert.equal(specs[0].version, 'v1.0.0')
			assert.ok(specs[0].path.endsWith('task.spec.js'))
		})

		it('finds test files (closed contracts)', () => {
			const dir = join(TMP, 'releases/1/0/v1.0.0')
			mkdirSync(dir, { recursive: true })
			writeFileSync(join(dir, 'task.test.js'), '// test')

			const scanner = new Scanner(TMP)
			const tests = scanner.findTests()

			assert.equal(tests.length, 1)
			assert.equal(tests[0].version, 'v1.0.0')
		})

		it('finds flat structure too (releases/v2.0.0/)', () => {
			const dir = join(TMP, 'releases/v2.0.0')
			mkdirSync(dir, { recursive: true })
			writeFileSync(join(dir, 'task.spec.js'), '// spec')

			const scanner = new Scanner(TMP)
			const specs = scanner.findSpecs()

			assert.equal(specs.length, 1)
			assert.equal(specs[0].version, 'v2.0.0')
		})
	})

	describe('multiple versions', () => {
		it('finds all specs across multiple versions', () => {
			const v1 = join(TMP, 'releases/1/0/v1.0.0')
			const v2 = join(TMP, 'releases/2/0/v2.0.0')
			mkdirSync(v1, { recursive: true })
			mkdirSync(v2, { recursive: true })
			writeFileSync(join(v1, 'task.spec.js'), '// v1 spec')
			writeFileSync(join(v2, 'task.spec.js'), '// v2 spec')

			const scanner = new Scanner(TMP)
			const specs = scanner.findSpecs()

			assert.equal(specs.length, 2)
			const versions = specs.map((s) => s.version).sort()
			assert.deepEqual(versions, ['v1.0.0', 'v2.0.0'])
		})

		it('separates specs from tests', () => {
			const v1 = join(TMP, 'releases/1/0/v1.0.0')
			const v2 = join(TMP, 'releases/2/0/v2.0.0')
			mkdirSync(v1, { recursive: true })
			mkdirSync(v2, { recursive: true })
			writeFileSync(join(v1, 'task.test.js'), '// closed')
			writeFileSync(join(v2, 'task.spec.js'), '// wip')

			const scanner = new Scanner(TMP)
			assert.equal(scanner.findSpecs().length, 1)
			assert.equal(scanner.findTests().length, 1)
		})
	})

	describe('filter by version', () => {
		it('finds specs for a specific version', () => {
			const v1 = join(TMP, 'releases/1/0/v1.0.0')
			const v2 = join(TMP, 'releases/2/0/v2.0.0')
			mkdirSync(v1, { recursive: true })
			mkdirSync(v2, { recursive: true })
			writeFileSync(join(v1, 'task.spec.js'), '// v1')
			writeFileSync(join(v2, 'task.spec.js'), '// v2')

			const scanner = new Scanner(TMP)
			const specs = scanner.findSpecs('v2.0.0')

			assert.equal(specs.length, 1)
			assert.equal(specs[0].version, 'v2.0.0')
		})
	})

	describe('status', () => {
		it('returns status for all versions', () => {
			const v1 = join(TMP, 'releases/1/0/v1.0.0')
			const v2 = join(TMP, 'releases/2/0/v2.0.0')
			mkdirSync(v1, { recursive: true })
			mkdirSync(v2, { recursive: true })
			writeFileSync(join(v1, 'task.test.js'), '// closed')
			writeFileSync(join(v2, 'task.spec.js'), '// wip')

			const scanner = new Scanner(TMP)
			const status = scanner.status()

			assert.equal(status.length, 2)
			const v1s = status.find((s) => s.version === 'v1.0.0')
			const v2s = status.find((s) => s.version === 'v2.0.0')
			assert.equal(v1s.state, 'closed')
			assert.equal(v2s.state, 'wip')
		})
	})

	describe('empty releases', () => {
		it('returns empty arrays when no releases directory', () => {
			const scanner = new Scanner(TMP)
			assert.deepEqual(scanner.findSpecs(), [])
			assert.deepEqual(scanner.findTests(), [])
		})
	})
})
