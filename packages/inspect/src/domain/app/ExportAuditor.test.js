import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { JsExportAuditor } from './js/JsExportAuditor.js'
import { DB } from '@nan0web/db'

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

describe('ExportAuditor', () => {
	it('fails when src/index.js is missing', async () => {
		const db = new DB({ predefined: [
			['package.json', { name: 'test', exports: {} }],
			['src/', {}],
		] })
		await db.connect()

		const auditor = new JsExportAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'src/index.js'))
	})

	it('fails when src/domain/ exists but src/domain/index.js is missing', async () => {
		const db = new DB({ predefined: [
			['package.json', { name: 'test', exports: {} }],
			['src/index.js', 'export const x = 1'],
			['src/domain/', {}],
		] })
		await db.connect()

		const auditor = new JsExportAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'src/domain/index.js'))
	})

	it('fails when src/ui/cli exists but not declared in exports', async () => {
		const db = new DB({ predefined: [
			['package.json', { name: 'test', exports: {} }],
			['src/index.js', 'export const x = 1'],
			['src/ui/', {}],
			['src/ui/cli/', {}],
		] })
		await db.connect()

		const auditor = new JsExportAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'exports["./ui/cli"]'))
	})

	it('passes for a fully correct package structure', async () => {
		const db = new DB({ predefined: [
			['package.json', {
				name: 'test',
				exports: { './ui/cli': './src/ui/cli/index.js' }
			}],
			['src/index.js', 'export const x = 1'],
			['src/domain/index.js', 'export const y = 2'],
			['src/ui/cli/', {}],
		] })
		await db.connect()

		const auditor = new JsExportAuditor({ dir: '.' }, { db })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})
})
