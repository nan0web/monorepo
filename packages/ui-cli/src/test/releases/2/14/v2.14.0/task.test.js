import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DBFS from '@nan0web/db-fs'

describe('Release v2.14.0: Documentation Integrity', async () => {
	const fs = new DBFS()
	const content = await fs.loadDocument('src/README.md.js')

	it('README.md.js should use ask(Alert(...)) instead of console.info', () => {
		assert.ok(content.includes('await ask(Alert'), 'Should use ask(Alert...)')
		assert.ok(!content.includes('console.info(Alert'), 'Should not use console.info for Alert')
	})

	it('README.md.js should use ask(Table(...)) instead of console.info', () => {
		assert.ok(content.includes('await ask(Table'), 'Should use ask(Table...)')
		assert.ok(!content.includes('console.info(Table'), 'Should not use console.info for Table')
	})

	it('README.md.js should document OLMUI Generators with yield', () => {
		assert.ok(content.includes('yield render('), 'Should document yielding render intents')
	})
})
