import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Email from './Email.js'
import Address from './Address.js'
import Target from './Target.js'
import Attachment from './Attachment.js'

describe('Email class', () => {
	it('should initialize correctly with default values', () => {
		const email = new Email({})
		assert.strictEqual(email.subject, '')
		assert.strictEqual(email.html, '')
		assert.deepStrictEqual(email.fields, {})
		assert.ok(email.from instanceof Address)
		assert.ok(email.target instanceof Target)
		assert.strictEqual(email.style, '')
		assert.strictEqual(email.dir, null)
		assert.deepStrictEqual(email.attachments, [])
	})

	it('should initialize correctly with provided values', () => {
		const opts = {
			subject: 'Test Subject',
			html: '<p>Test HTML</p>',
			fields: { test: 'value' },
			from: 'Sender <sender@example.com>',
			to: 'Recipient <recipient@example.com>',
			style: 'body { color: red; }',
			dir: '/test/dir',
			attachments: [{ filename: 'test.txt', path: './test.txt' }],
		}
		const email = new Email(opts)
		assert.strictEqual(email.subject, 'Test Subject')
		assert.strictEqual(email.html, '<p>Test HTML</p>')
		assert.deepStrictEqual(email.fields, { test: 'value' })
		assert.ok(email.from instanceof Address)
		assert.ok(email.target instanceof Target)
		assert.strictEqual(email.style, 'body { color: red; }')
		assert.strictEqual(email.dir, '/test/dir')
		assert.strictEqual(email.attachments.length, 1)
		assert.ok(email.attachments[0] instanceof Attachment)
	})

	it('should add single attachment', () => {
		const email = new Email({})
		const attachment = { filename: 'test.txt', path: './test.txt' }
		email.attach(attachment)
		assert.strictEqual(email.attachments.length, 1)
		assert.ok(email.attachments[0] instanceof Attachment)
	})

	it('should add multiple attachments', () => {
		const email = new Email({})
		const attachments = [
			{ filename: 'test1.txt', path: './test1.txt' },
			{ filename: 'test2.txt', path: './test2.txt' },
		]
		email.attach(attachments)
		assert.strictEqual(email.attachments.length, 2)
		assert.ok(email.attachments[0] instanceof Attachment)
		assert.ok(email.attachments[1] instanceof Attachment)
	})

	it('should format for nodemailer with replacements', () => {
		const opts = {
			subject: 'Hello {{name}}',
			html: '<p>Dear {{name}},</p>',
			from: 'Sender <sender@example.com>',
			to: 'Recipient <recipient@example.com>',
			attachments: [{ filename: 'document-{{name}}.pdf', path: './document.pdf' }],
		}
		const email = new Email(opts)
		const replacements = { name: 'John' }
		const formatted = email.formatForNodemailer(replacements)

		assert.strictEqual(formatted.subject, 'Hello John')
		assert.strictEqual(formatted.html, '<p>Dear John,</p>')
		assert.strictEqual(formatted.from, 'Sender <sender@example.com>')
		assert.strictEqual(formatted.to, 'Recipient <recipient@example.com>')
		assert.strictEqual(formatted.attachments[0].filename, 'document-John.pdf')
	})
})
