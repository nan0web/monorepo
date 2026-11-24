import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { SyncCommand } from './SyncCommand.js'

describe('SyncCommand Story', () => {
	it('exports tasks to ics and kindle txt', async () => {
		const db = new DB({ predefined: [['todo.md', '- [ ] Купити хліб\n']] })
		await db.connect()

		const icsCmd = new SyncCommand({ target: 'ics', file: 'todo.md', out: 'out.ics' }, { db })
		let s = await icsCmd.run().next()
		const genIcs = icsCmd.run()
		while (!(s = await genIcs.next()).done) {}
		assert.equal((s.value?.data || s.value).ok, true)

		const kindleCmd = new SyncCommand({ target: 'kindle', format: 'txt', file: 'todo.md' }, { db })
		const genK = kindleCmd.run()
		while (!(s = await genK.next()).done) {}
		assert.ok((s.value?.data || s.value).content.includes('Купити хліб'))
	})
})
