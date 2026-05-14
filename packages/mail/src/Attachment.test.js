import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Attachment from './Attachment.js'

describe('Attachment class', () => {
	it('should initialize correctly with default values', () => {
		const attachment = new Attachment({})
		assert.strictEqual(attachment.filename, '')
		assert.strictEqual(attachment.content, '')
		assert.strictEqual(attachment.path, '')
		assert.strictEqual(attachment.href, '')
		assert.strictEqual(attachment.httpHeaders, '')
		assert.strictEqual(attachment.contentType, '')
		assert.strictEqual(attachment.contentDisposition, 'attachment')
		assert.strictEqual(attachment.cid, '')
		assert.strictEqual(attachment.encoding, '')
		assert.strictEqual(attachment.headers, '')
		assert.strictEqual(attachment.raw, '')
	})

	it('should initialize correctly with provided values', () => {
		const opts = {
			filename: 'document.pdf',
			content: 'PDF content',
			path: '/path/to/document.pdf',
			href: 'http://example.com/document.pdf',
			httpHeaders: 'Authorization: Bearer token',
			contentType: 'application/pdf',
			contentDisposition: 'inline',
			cid: 'document1',
			encoding: 'base64',
			headers: 'X-Custom: value',
			raw: 'raw data',
		}
		const attachment = new Attachment(opts)
		assert.strictEqual(attachment.filename, 'document.pdf')
		assert.strictEqual(attachment.content, 'PDF content')
		assert.strictEqual(attachment.path, '/path/to/document.pdf')
		assert.strictEqual(attachment.href, 'http://example.com/document.pdf')
		assert.strictEqual(attachment.httpHeaders, 'Authorization: Bearer token')
		assert.strictEqual(attachment.contentType, 'application/pdf')
		assert.strictEqual(attachment.contentDisposition, 'inline')
		assert.strictEqual(attachment.cid, 'document1')
		assert.strictEqual(attachment.encoding, 'base64')
		assert.strictEqual(attachment.headers, 'X-Custom: value')
		assert.strictEqual(attachment.raw, 'raw data')
	})

	it('should format for nodemailer', () => {
		const attachment = new Attachment({
			filename: 'document.pdf',
			path: '/path/to/document.pdf',
			contentType: 'application/pdf',
		})
		const formatted = attachment.formatForNodemailer()
		assert.deepStrictEqual(formatted, {
			filename: 'document.pdf',
			path: '/path/to/document.pdf',
			contentType: 'application/pdf',
			contentDisposition: 'attachment',
		})
	})

	it('should create from Attachment instance', () => {
		const original = new Attachment({ filename: 'test.txt' })
		const attachment = Attachment.from(original)
		assert.strictEqual(attachment, original)
	})

	it('should create from object', () => {
		const attachment = Attachment.from({ filename: 'test.txt' })
		assert.ok(attachment instanceof Attachment)
		assert.strictEqual(attachment.filename, 'test.txt')
	})
})
