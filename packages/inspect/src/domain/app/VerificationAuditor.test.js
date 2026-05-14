import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { VerificationAuditor } from './VerificationAuditor.js'
import { DB } from '@nan0web/db'

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

describe('VerificationAuditor', () => {
	it('fails when play/ is missing', async () => {
		const db = new DB({ predefined: [
			['src/foo.test.js', 'test("x", () => {})'],
			['src/README.md.js', ''],
		] })
		await db.connect()
		const auditor = new VerificationAuditor({ dir: '.' }, { db })
		auditor.isTestFile = (e) => e.name.endsWith('.test.js')
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'play/'))
	})

	it('fails when no *.test.js files exist in src/', async () => {
		const db = new DB({ predefined: [
			['play/', {}],
			['src/README.md.js', ''],
		] })
		await db.connect()
		const auditor = new VerificationAuditor({ dir: '.' }, { db })
		auditor.isTestFile = (e) => e.name.endsWith('.test.js')
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'src/**/test_*'))
	})

	it('passes when all mandatory verification items exist (src/README.md.js variant)', async () => {
		const db = new DB({ predefined: [
			['play/', {}],
			['src/foo.test.js', 'test("x", () => {})'],
			['src/README.md.js', ''],
			['snapshots/core/', {}],
		] })
		await db.connect()
		const auditor = new VerificationAuditor({ dir: '.' }, { db })
		auditor.isTestFile = (e) => e.name.endsWith('.test.js')
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})

	it('passes when README.md.js is in src/docs/', async () => {
		const db = new DB({ predefined: [
			['play/', {}],
			['src/foo.test.js', 'test("x", () => {})'],
			['src/docs/README.md.js', ''],
			['snapshots/core/', {}],
		] })
		await db.connect()
		const auditor = new VerificationAuditor({ dir: '.' }, { db })
		auditor.isTestFile = (e) => e.name.endsWith('.test.js')
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})
})
