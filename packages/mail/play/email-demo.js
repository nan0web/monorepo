#!/usr/bin/env node

import Logger from '@nan0web/log'
import { Email, Attachment, Address, Target } from '../src/index.js'
import createMailer from '../src/createMailer.js'

/**
 * Demonstrates creating an Email with placeholders,
 * adding an attachment and sending it via a dummy mailer.
 *
 * @param {Logger} console - Logger instance for output.
 */
export async function runEmailDemo(console) {
	console.clear()
	console.success('📧 Mail Package – Email Demo')

	// Build an email with placeholders
	const email = new Email({
		subject: 'Invoice {{id}} for {{name}}',
		html: '<p>Hello {{name}}, your invoice {{id}} is ready.</p>',
		from: 'Billing <billing@example.com>',
		to: 'Customer <customer@example.com>',
		attachments: [
			{
				filename: 'invoice-{{id}}.pdf',
				path: './invoices/{{id}}.pdf',
			},
		],
	})

	const data = { id: '001', name: 'Alice' }

	// Dummy mailer that just records the sendMail payload
	class DummyMailer {
		async sendMail(msg) {
			Object.assign(this, msg)
			return { ok: true }
		}
	}
	const dummy = new DummyMailer()

	// Send using the mail helper
	const { mail } = await import('../src/mail.js')
	const info = await mail(email, data, { mailer: dummy })
	console.info('✉️ Sent info:', info)

	console.info('📨 Message sent:')
	console.info('From:', dummy.from)
	console.info('To:', dummy.to)
	console.info('Subject:', dummy.subject)
	console.info('HTML:', dummy.html)
	console.info('Attachments:', dummy.attachments)

	console.success('✅ Email demo complete')
}
