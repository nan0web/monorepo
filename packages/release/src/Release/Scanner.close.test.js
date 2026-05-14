import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import Scanner from './Scanner.js'

const TMP = join(tmpdir(), 'nan0release-close-test-' + Date.now())

describe('Scanner.close()', () => {
	beforeEach(() => {
		mkdirSync(TMP, { recursive: true })
	})

	afterEach(() => {
		rmSync(TMP, { recursive: true, force: true })
	})

	it('renames spec → test for a specific version', () => {
		const dir = join(TMP, 'releases/2/0/v2.0.0')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'task.spec.js'), '// contract')

		const scanner = new Scanner(TMP)
		const result = scanner.close('v2.0.0')

		assert.equal(result.closed, 1)
		assert.ok(!existsSync(join(dir, 'task.spec.js')), 'spec should be gone')
		assert.ok(existsSync(join(dir, 'task.test.js')), 'test should exist')
	})

	it('renames multiple spec files in the same version', () => {
		const dir = join(TMP, 'releases/2/0/v2.0.0')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'task.spec.js'), '// contract 1')
		writeFileSync(join(dir, 'api.spec.js'), '// contract 2')

		const scanner = new Scanner(TMP)
		const result = scanner.close('v2.0.0')

		assert.equal(result.closed, 2)
		assert.ok(existsSync(join(dir, 'task.test.js')))
		assert.ok(existsSync(join(dir, 'api.test.js')))
	})

	it('returns 0 when no specs found for version', () => {
		mkdirSync(join(TMP, 'releases/1/0/v1.0.0'), { recursive: true })
		writeFileSync(join(TMP, 'releases/1/0/v1.0.0/task.test.js'), '// already closed')

		const scanner = new Scanner(TMP)
		const result = scanner.close('v1.0.0')

		assert.equal(result.closed, 0)
	})

	it('throws when version not found', () => {
		mkdirSync(join(TMP, 'releases'), { recursive: true })

		const scanner = new Scanner(TMP)
		assert.throws(() => scanner.close('v9.9.9'), /not found/i)
	})

	it('works with flat structure (releases/v2.0.0/)', () => {
		const dir = join(TMP, 'releases/v2.0.0')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'task.spec.js'), '// flat')

		const scanner = new Scanner(TMP)
		const result = scanner.close('v2.0.0')

		assert.equal(result.closed, 1)
		assert.ok(existsSync(join(dir, 'task.test.js')))
	})

	it('close --all renames all specs across versions', () => {
		const v1 = join(TMP, 'releases/1/0/v1.0.0')
		const v2 = join(TMP, 'releases/2/0/v2.0.0')
		mkdirSync(v1, { recursive: true })
		mkdirSync(v2, { recursive: true })
		writeFileSync(join(v1, 'task.spec.js'), '// v1')
		writeFileSync(join(v2, 'task.spec.js'), '// v2')

		const scanner = new Scanner(TMP)
		const result = scanner.close()

		assert.equal(result.closed, 2)
		assert.ok(existsSync(join(v1, 'task.test.js')))
		assert.ok(existsSync(join(v2, 'task.test.js')))
	})
})
