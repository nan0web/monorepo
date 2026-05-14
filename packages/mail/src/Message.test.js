import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Message from './Message.js'
import Address from './Address.js'
import Attachment from './Attachment.js'

describe('Message class', () => {
	it('should initialize correctly with default values', () => {
		const message = new Message({})
		assert.strictEqual(message.body, undefined)
		assert.ok(message.from instanceof Address)
		assert.ok(message.to instanceof Address)
		assert.strictEqual(message.dir, null)
		assert.deepStrictEqual(message.attachments, [])
	})

	it('should initialize correctly with provided values', () => {
		const opts = {
			body: 'test-message',
			from: 'Sender <sender@example.com>',
			to: 'Recipient <recipient@example.com>',
			dir: '/test/dir',
			attachments: [new Attachment({ filename: 'test.txt', path: './test.txt' })],
		}
		const message = new Message(opts)
		assert.strictEqual(message.body, 'test-message')
		assert.ok(message.from instanceof Address)
		assert.ok(message.to instanceof Address)
		assert.strictEqual(message.dir, '/test/dir')
		assert.strictEqual(message.attachments.length, 1)
		assert.ok(message.attachments[0] instanceof Attachment)
	})

	it('should add single attachment', () => {
		const message = new Message({})
		const attachment = new Attachment({ filename: 'test.txt', path: './test.txt' })
		message.attach(attachment)
		assert.strictEqual(message.attachments.length, 1)
		assert.ok(message.attachments[0] instanceof Attachment)
	})

	it('should add multiple attachments', () => {
		const message = new Message({})
		const attachments = [
			new Attachment({ filename: 'test1.txt', path: './test1.txt' }),
			new Attachment({ filename: 'test2.txt', path: './test2.txt' }),
		]
		message.attach(attachments)
		assert.strictEqual(message.attachments.length, 2)
		assert.ok(message.attachments[0] instanceof Attachment)
		assert.ok(message.attachments[1] instanceof Attachment)
	})
})
