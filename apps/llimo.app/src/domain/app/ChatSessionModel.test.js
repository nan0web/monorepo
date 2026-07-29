import { describe, it } from 'node:test'
import assert from 'node:assert'

import { DB } from '@nan0web/db'

import { ChatSessionModel } from './ChatSessionModel.js'

describe('ChatSessionModel', () => {
	it('should generate proper system prompt', async () => {
		const db = new DB()
		const appDb = new DB({
			predefined: [['data/uk/system.md', 'System prompt']],
		})
		db.mount('@app', appDb)
		await db.connect()
		await appDb.connect()

		const model = new ChatSessionModel({}, { db })
		const systemPrompt = await model.generateSystemPrompt()

		assert.equal(systemPrompt, 'System prompt')
	})
})
