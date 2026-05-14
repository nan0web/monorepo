import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { JsHygieneAuditor } from './js/JsHygieneAuditor.js'

/**
 * @param {AsyncGenerator} gen
 * @returns {Promise<{intents: object[], result: object}>}
 */
async function drainGenerator(gen) {
	const intents = []
	let last = null
	while (true) {
		const step = await gen.next()
		if (step.done) { last = step.value; break }
		intents.push(step.value)
	}
	return { intents, result: last }
}

const minScripts = {
	test: 'node --test',
	'test:all': 'npm run test && npm run build && npm run knip',
	build: 'tsc',
	knip: 'knip --production',
	play: 'node play/main.js',
	'test:docs': 'node --test src/README.md.js',
	'test:release': 'node --test src/test/releases/**/*.test.js',
	'release:spec': 'node --test releases/**/*.spec.js',
	'test:coverage': 'c8 node --test',
	'prebuild': 'rm -rf dist types',
}

describe('JsHygieneAuditor', () => {
	it('reports missing scripts and missing config files', async () => {
		const db = new DB({ predefined: [
			['package.json', { name: 'test', scripts: { test: 'node --test' } }],
		] })
		await db.connect()
		const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.type, 'result')
		assert.equal(result.data.success, false)

		const checks = result.data.errors.map((e) => e.check)
		assert.ok(checks.some((c) => c === 'scripts.test:all'))
		assert.ok(checks.includes('tsconfig.json'))
	})

	it('passes for a fully configured package', async () => {
		const db = new DB({ predefined: [
			['package.json', { 
				name: 'test', 
				scripts: minScripts,
				devDependencies: {
					typescript: 'latest',
					knip: 'latest',
					c8: 'latest'
				}
			}],
			['tsconfig.json', {}],
			['knip.json', {}],
		] })
		await db.connect()
		const auditor = new JsHygieneAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.type, 'result')
		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})

	it('automatically fixes missing scripts when fix: true is set', async () => {
		const db = new DB({ predefined: [
			['package.json', { name: 'test', scripts: { test: 'node --test' } }],
			['tsconfig.json', {}],
			['knip.json', {}],
		] })
		await db.connect()
		
		// Run with fix: true
		const auditor = new JsHygieneAuditor({ dir: '.' }, { db, fix: true, t: (k) => k })
		await drainGenerator(auditor.run())

		// Verify package.json was updated
		const pkg = await db.loadDocument('package.json')
		assert.ok(pkg.scripts.build, 'build script should have been added')
		assert.ok(pkg.scripts['test:all'], 'test:all script should have been added')
		assert.ok(pkg.scripts.prebuild, 'prebuild script should have been added')
	})
})
