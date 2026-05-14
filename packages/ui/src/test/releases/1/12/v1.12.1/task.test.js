import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'

const db = new DB()

describe('Mission 1.12.1: Types Refinement', () => {
	it('seed.md should be deleted', async () => {
		const stat = await db.statDocument('seed.md')
		assert.ok(stat.error, 'seed.md is still present')
	})

	it('nan0web.nan0 should be present in root', async () => {
		const stat = await db.statDocument('nan0web.nan0')
		assert.ok(!stat.error, 'nan0web.nan0 is missing')
	})

	it('Agent workflows should be present in src/agents/workflows', async () => {
		const stat = await db.statDocument('src/agents/workflows')
		assert.ok(!stat.error, 'src/agents/workflows is missing')
	})
})
