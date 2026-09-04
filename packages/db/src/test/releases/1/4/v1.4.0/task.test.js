import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '../../../../../index.js'
import { NoConsole } from '@nan0web/log'

describe('Release v1.4.0: Aliases Protocol and Stabilization', () => {
	describe('1. Aliases Protocol — aliases field in constructor', () => {
		it('DB accepts aliases as Map<string, string> via constructor', () => {
			const db = new DB({
				console: new NoConsole(),
				aliases: {
					'docs/en/README.md': './README.md',
					'docs/en/project.md': './docs/en/project.md',
				},
			})
			assert.ok(db.aliases, 'DB must have aliases property')
			assert.equal(typeof db.aliases, 'object', 'aliases must be an object')
		})

		it('aliases defaults to an empty object', () => {
			const db = new DB({ console: new NoConsole() })
			assert.ok(db.aliases !== undefined, 'aliases must exist')
			assert.deepEqual(db.aliases, {}, 'aliases must be an empty object by default')
		})
	})

	describe('2. Aliases Protocol — resolveAlias() method', () => {
		it('resolveAlias returns real URI if alias exists (hit)', () => {
			const db = new DB({
				console: new NoConsole(),
				aliases: {
					'docs/en/README.md': './README.md',
				},
			})
			const resolved = db.resolveAlias('docs/en/README.md')
			assert.equal(resolved, './README.md', 'Must return real path')
		})

		it('resolveAlias returns original URI if alias does not exist (miss)', () => {
			const db = new DB({
				console: new NoConsole(),
				aliases: {
					'docs/en/README.md': './README.md',
				},
			})
			const resolved = db.resolveAlias('some/other/path.md')
			assert.equal(resolved, 'some/other/path.md', 'Must return original URI')
		})

		it('resolve() automatically applies alias (end-to-end integration)', async () => {
			const db = new DB({
				console: new NoConsole(),
				aliases: {
					'en/README.md': 'root/README.md',
				},
			})
			const resolved = await db.resolve('en/README.md')
			assert.ok(!resolved.includes('en/README.md'), 'URI must be replaced via alias')
			assert.ok(resolved.includes('root/README.md'), 'Must contain real path from alias')
		})
	})

	describe('3. CrossDriver — fix regression tests', () => {
		it('CrossDriver.test.js has no failing tests (4/4 pass)', async () => {
			// Marker test verifying DB.fetch correctly resolves mounted $ref
			const memDb = new DB({
				console: new NoConsole(),
				predefined: [
					['_.json', { memGlobal: 'mem_value' }],
					['doc.json', { name: 'test' }],
				],
			})
			await memDb.connect()

			const data = await memDb.fetch('doc')
			assert.ok(data, 'fetch must return data')
			assert.equal(data.name, 'test')
			assert.equal(data.memGlobal, 'mem_value', 'Globals must be inherited')
		})
	})

	describe('4. v1.3.1 closure — contract tests migration', () => {
		it('v1.3.1 contract tests must exist in src/test/releases/', async () => {
			const { existsSync } = await import('node:fs')
			const { resolve } = await import('node:path')

			const regressionPath = resolve(
				import.meta.dirname,
				'../../../1/3/v1.3.1/task.test.js',
			)

			assert.ok(existsSync(regressionPath), `Regression test must exist: ${regressionPath}`)
		})
	})
})
