import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import createMailer from './createMailer.js'

describe('createMailer', () => {
	it('should create a nodemailer transport object', async () => {
		const transport = createMailer({ jsonTransport: true })
		assert.ok(transport)
		assert.equal(typeof transport.sendMail, 'function')
		const info = await transport.sendMail({
			from: 'a@b.c',
			to: 'd@e.f',
			subject: 'test',
			text: 'hello',
		})
		// jsonTransport returns the message object
		assert.ok(info)
	})
})
