import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { JsDomainAuditor } from './js/JsDomainAuditor.js'
import { DomainAuditor } from './DomainAuditor.js'
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

describe('DomainAuditor', () => {
	it('detects extends Model outside src/domain/', async () => {
		const db = new DB({ predefined: [
			['src/SomeUtil.js', 'import { Model } from "@nan0web/types"\nexport class SomeUtil extends Model {}\n'],
		] })
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.error.startsWith(DomainAuditor.UI.violation_found.split('{')[0])))
	})

	it('allows extends Model inside src/domain/', async () => {
		const db = new DB({ predefined: [
			['src/domain/MyModel.js', 'import { Model } from "@nan0web/types"\nexport class MyModel extends Model {}\n'],
		] })
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		assert.equal(result.data.errors.length, 0)
	})

	it('passes when no src/ directory exists', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
	})
})
