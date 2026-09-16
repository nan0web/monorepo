import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'

describe('Recipe: Package Types, Exports & Test-First Build', () => {
	it('validates package.json exports, types, files and test-first build scripts', async () => {
		const pkg = {
			name: '@nan0web/test-package',
			version: '1.0.0',
			type: 'module',
			main: './src/index.js',
			types: './types/index.d.ts',
			files: [
				'src/**/*.js',
				'src/**/*.ts',
				'src/**/*.tsx',
				'!src/**/*.spec.js',
				'!src/**/*.spec.tsx',
				'!src/**/*.test.js',
				'types/**/*.d.ts',
			],
			exports: {
				'.': {
					types: './types/index.d.ts',
					import: './src/index.js',
				},
				'./feature/*': {
					types: './types/feature/*.d.ts',
					import: './src/feature/*.js',
				},
			},
			scripts: {
				prebuild: 'rm -rf types/',
				build: 'tsc',
				test: 'node --test "src/**/*.test.js"',
				'test:release': 'node --test "src/test/releases/**/*.test.js"',
				'release:spec': 'node --test "releases/**/*.spec.js"',
				'test:all': 'npm run test && npm run build && npm run test:release',
			},
		}

		// 1. Check test-first script sequence and canonical separation
		assert.ok(pkg.scripts['test:all'].startsWith('npm run test'))
		assert.ok(pkg.scripts['test:all'].includes('npm run build'))
		assert.equal(pkg.scripts['test'], 'node --test "src/**/*.test.js"')
		assert.equal(pkg.scripts['release:spec'], 'node --test "releases/**/*.spec.js"')

		// 2. Check exports matching types
		for (const [key, val] of Object.entries(pkg.exports)) {
			assert.ok(val.types, `Missing types for export ${key}`)
			assert.ok(val.import, `Missing import for export ${key}`)
			assert.ok(val.types.startsWith('./types/'), `Types path must point to ./types for ${key}`)
		}

		// 3. Verify in-memory DB can load recipe manifest
		const db = new DB({
			predefined: [
				['package.json', pkg],
			],
		})
		await db.connect()

		const doc = await db.loadDocument('package.json')
		assert.equal(doc.name, '@nan0web/test-package')
		assert.equal(doc.scripts['test:all'], 'npm run test && npm run build && npm run test:release')
	})
})
