import test from 'node:test'
import assert from 'node:assert/strict'
import { TelegramAdapter } from './TelegramAdapter.js'
import { SocialAdapterConfig } from './Models.js'

test('TelegramAdapter', async (t) => {
	const validConfig = new SocialAdapterConfig({
		credentials: { token: 'dummy-token' },
	})

	const invalidConfig = new SocialAdapterConfig({
		credentials: {}, // missing token
	})

	await t.test('verify succeeds with a token', async () => {
		const adapter = new TelegramAdapter(validConfig)
		const res = await adapter.verify()
		assert.ok(res)
	})

	await t.test('verify fails without a token', async () => {
		const adapter = new TelegramAdapter(invalidConfig)
		await assert.rejects(
			() => adapter.verify(),
			/missing token/
		)
	})

	await t.test('publish returns a result with an id and stores the post', async () => {
		const adapter = new TelegramAdapter(validConfig)
		const content = { text: 'Hello Telegram!' }
		const result = await adapter.publish(content)

		assert.ok(result.id)
		assert.ok(result.url)
		assert.equal(result.payload.text, content.text)

		// Deleting the same message should succeed.
		const delRes = await adapter.delete(result.id)
		assert.ok(delRes)
	})

	await t.test('publish with a photo works', async () => {
		const adapter = new TelegramAdapter(validConfig)
		const content = { text: 'Check this photo', photo: 'https://example.com/photo.jpg' }
		const result = await adapter.publish(content)

		assert.equal(result.payload.photo, content.photo)

		// Clean‑up
		assert.ok(await adapter.delete(result.id))
	})
})