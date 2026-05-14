import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import mail from './mail.js'
import Email from './Email.js'

// Dummy mailer that records the argument passed to sendMail
class DummyMailer {
	async sendMail(msg) {
		Object.assign(this, msg)
		return { ok: true }
	}
}

describe('mail function', () => {
	const base = {
		subject: 'Hello {{name}}',
		html: '<p class="lead">Hello {{name}}</p>',
		from: 'Sender <sender@example.com>',
		to: 'Recipient <recipient@example.com>',
		text: 'Plain {{name}}',
	}
	const data = { name: 'John' }
	const nano = [{ 'p.lead': 'Hello {{name}}' }]
	const old = [{ $class: 'lead', p: 'Hello {{name}}' }]
	for (const opts of [base, { ...base, html: nano }, { ...base, html: old }]) {
		it(
			'should build and send an email using the provided mailer and data ' +
				JSON.stringify(opts.html),
			async () => {
				const mailer = new DummyMailer()
				const email = new Email(opts)
				const info = await mail(email, data, { mailer, htmlEol: '\n' })
				assert.ok(info.ok)
				assert.strictEqual(String(mailer.from), 'Sender <sender@example.com>')
				assert.strictEqual(mailer.subject, 'Hello John')
				assert.strictEqual(mailer.text, 'Plain John')
				assert.strictEqual(mailer.html.includes('<p class="lead">Hello John</p>'), true)
				assert.deepStrictEqual(mailer.attachments, [])
			},
		)
	}
})
