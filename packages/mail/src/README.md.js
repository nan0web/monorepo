import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import { Address, Attachment, Email, MailDB, Message, Target, createMailer, mail } from './index.js'

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/mail
	 *
	 * A tiny, type-safe mail helper built on **nodemailer**. It
	 * provides ready-made classes for addresses, attachments,
	 * e-mail composition and a tiny DB helper.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/mail
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/mail')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/mail
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/mail')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/mail
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/mail')
	})

	/**
	 * @docs
	 * ## Usage – Address
	 *
	 * Simple value object for e-mail, telephone or any address.
	 */
	it('How to create an Address from a string?', () => {
		//import { Address } from '@nan0web/mail'
		const addr = Address.from('John Doe <john@example.com>')
		console.info(String(addr))
		// John Doe <john@example.com>
		assert.equal(console.output()[0][1], 'John Doe <john@example.com>')
		assert.ok(addr instanceof Address)
		assert.strictEqual(addr.name, 'John Doe')
		assert.strictEqual(addr.address, 'john@example.com')
		assert.strictEqual(addr.type, 'email')
	})
	/**
	 * @docs
	 */
	it('How to create an Address from an object?', () => {
		//import { Address } from '@nan0web/mail'
		const addr = Address.from({ address: 'test@example.com', name: 'Test User' })
		console.info(String(addr))
		// Test User <test@example.com>
		assert.equal(console.output()[0][1], 'Test User <test@example.com>')
		assert.ok(addr instanceof Address)
		assert.strictEqual(addr.address, 'test@example.com')
		assert.strictEqual(addr.name, 'Test User')
	})

	/**
	 * @docs
	 * ## Usage – Attachment
	 *
	 * Build a Nodemailer attachment, placeholders are replaced
	 * by the `replace` function.
	 */
	it('How to create an Attachment and format it for Nodemailer?', () => {
		//import { Attachment } from '@nan0web/mail'
		const att = new Attachment({
			filename: 'invoice-{{id}}.pdf',
			path: './invoices/{{id}}.pdf',
			contentDisposition: 'inline',
		})
		const formatted = att.formatForNodemailer({ id: '123' })
		console.info(JSON.stringify(formatted))
		// {"filename":"invoice-123.pdf","path":"./invoices/123.pdf","contentDisposition":"inline"}
		assert.equal(
			console.output()[0][1],
			'{"filename":"invoice-123.pdf","path":"./invoices/123.pdf","contentDisposition":"inline"}',
		)
	})

	/**
	 * @docs
	 * ## Usage – Email composition
	 *
	 * Create an `Email` object, add attachments and render
	 * it for Nodemailer.
	 */
	it('How to build an Email with placeholders and attachments?', () => {
		//import { Email, Attachment } from '@nan0web/mail'
		const mail = new Email({
			subject: 'Invoice {{id}}',
			html: '<p>Dear {{name}}, see attached.</p>',
			from: 'Billing <billing@example.com>',
			to: 'Customer <customer@example.com>',
			attachments: [
				{
					filename: 'invoice-{{id}}.pdf',
					path: './invoices/{{id}}.pdf',
				},
			],
		})
		const formatted = mail.formatForNodemailer({ id: '001', name: 'Alice' })
		console.info(JSON.stringify(formatted))
		// {"from":"Billing <billing@example.com>","to":"Customer <customer@example.com>","cc":"","bcc":"","subject":"Invoice 001","html":"<p>Dear Alice, see attached.</p>","attachments":[{"filename":"invoice-001.pdf","path":"./invoices/001.pdf","contentDisposition":"attachment"}]}
		assert.equal(
			console.output()[0][1],
			'{"from":"Billing <billing@example.com>","to":"Customer <customer@example.com>","cc":"","bcc":"","subject":"Invoice 001","html":"<p>Dear Alice, see attached.</p>","attachments":[{"filename":"invoice-001.pdf","path":"./invoices/001.pdf","contentDisposition":"attachment"}]}',
		)
	})

	/**
	 * @docs
	 * ## Usage – Target
	 *
	 * Handle multiple recipients: `to`, `cc`, `bcc`.
	 */
	it('How to create a Target with multiple recipients?', () => {
		//import { Target, Address } from '@nan0web/mail'
		const target = new Target()
		target.add('alice@example.com', 'to')
		target.add('bob@example.com', 'cc')
		target.add('carol@example.com', 'bcc')
		const formatted = target.formatForNodemailer()
		console.info(JSON.stringify(formatted))
		// {"to":"<alice@example.com>","cc":"<bob@example.com>","bcc":"<carol@example.com>"}
		assert.equal(
			console.output()[0][1],
			'{"to":"<alice@example.com>","cc":"<bob@example.com>","bcc":"<carol@example.com>"}',
		)
	})
	/**
	 * @docs
	 */
	it('How to create Target from object?', () => {
		//import { Target } from '@nan0web/mail'
		const target = Target.from({
			to: ['alice@example.com', 'david@example.com'],
			cc: 'bob@example.com',
		})
		const formatted = target.formatForNodemailer()
		console.info(JSON.stringify(formatted))
		// {"to":"<alice@example.com>, <david@example.com>","cc":"<bob@example.com>","bcc":""}
		assert.equal(
			console.output()[0][1],
			'{"to":"<alice@example.com>, <david@example.com>","cc":"<bob@example.com>","bcc":""}',
		)
	})

	/**
	 * @docs
	 * ## Usage – MailDB transformation
	 *
	 * Turn a raw record into an enriched object.
	 */
	it('How to transform data with MailDB?', async () => {
		//import { MailDB } from '@nan0web/mail'
		const db = new MailDB()
		const source = { name: 'John Smith', gender: 1, mail: 'john@example.com' }
		const config = {
			formattedName: [(item) => item.name.split(' ')[0]],
			genderText: [(item) => (item.gender === 1 ? 'male' : 'female')],
			email: { $ref: 'mail' },
			certificateNo: [(item) => '001'],
		}
		const result = await db.transform(source, config, {})
		console.info(JSON.stringify(result))
		// {"formattedName":"John","genderText":"male","email":"john@example.com","certificateNo":"001"}
		assert.equal(
			console.output()[0][1],
			'{"formattedName":"John","genderText":"male","email":"john@example.com","certificateNo":"001"}',
		)
	})

	/**
	 * @docs
	 * ## Usage – Message
	 *
	 * Build a message with sender, recipient and attachments.
	 */
	it('How to create and use a Message?', () => {
		//import { Message, Attachment } from '@nan0web/mail'
		const msg = new Message({
			body: 'test message',
			from: 'sender@example.com',
			to: 'recipient@example.com',
			attachments: [new Attachment({ filename: 'note.txt', content: 'Hello!' })],
		})
		console.info(String(msg))
		// 2025-10-28T10:09:11.143Z test message
		console.info(String(msg.from))
		// <sender@example.com>
		console.info(String(msg.to))
		// <recipient@example.com>
		console.info(JSON.stringify(msg.attachments))
		// [{"filename":"note.txt","content":"Hello!","path":"","href":"","httpHeaders":"","contentType":"","contentDisposition":"attachment","cid":"","encoding":"","headers":"","raw":""}]
		assert.ok(msg instanceof Message)
		assert.ok(console.output()[0][1].endsWith(' test message'))
		assert.equal(console.output()[1][1], '<sender@example.com>')
		assert.equal(console.output()[2][1], '<recipient@example.com>')
		assert.equal(
			console.output()[3][1],
			'[{"filename":"note.txt","content":"Hello!","path":"","href":"","httpHeaders":"","contentType":"","contentDisposition":"attachment","cid":"","encoding":"","headers":"","raw":""}]',
		)
	})

	/**
	 * @docs
	 * ## Usage – createMailer
	 *
	 * Helper that returns a Nodemailer transport.
	 */
	it('How to create a Nodemailer transport with createMailer?', () => {
		//import { createMailer } from '@nan0web/mail'
		const transport = createMailer({ jsonTransport: true })
		console.info(transport.constructor.name) // ← Mail
		assert.equal(console.output()[0][1], 'Mail')
	})

	/**
	 * @docs
	 * ## Usage – send mail
	 *
	 * The `mail` function composes everything and sends it.
	 */
	it('How to send an email using the `mail` helper?', async () => {
		//import { mail, Email } from '@nan0web/mail'
		class DummyMailer {
			from
			subject
			html
			attachments
			async sendMail(msg) {
				Object.assign(this, msg)
				return { ok: true }
			}
		}
		const dummy = new DummyMailer()
		const email = new Email({
			subject: 'Hi {{user}}',
			html: '<p>Hello {{user}}</p>',
			from: 'Me <me@example.com>',
			to: 'You <you@example.com>',
		})
		const data = { user: 'Bob' }
		const info = await mail(email, data, { mailer: dummy })
		console.info(info)
		// { ok: true }
		assert.deepStrictEqual(console.output()[0][1], { ok: true })
		assert.strictEqual(String(dummy.from), 'Me <me@example.com>')
		assert.strictEqual(dummy.subject, 'Hi Bob')
		assert.ok(dummy.html.includes('<p>Hello Bob</p>'))
		assert.deepStrictEqual(dummy.attachments, [])
	})

	/**
	 * @docs
	 * ## API reference
	 *
	 * ### Address
	 *
	 * * **Properties** `address`, `name`, `type`
	 *
	 * * **Methods** `toString()`, `toObject()`, static `from()`
	 *
	 * ### Attachment
	 *
	 * * **Properties** `filename`, `content`, `path`, `href`, `httpHeaders`, `contentType`, `contentDisposition`, `cid`, `encoding`, `headers`, `raw`
	 *
	 * * **Methods** `formatForNodemailer()`, static `from()`
	 *
	 * ### Email
	 *
	 * * **Properties** `subject`, `html`, `from`, `target`, `attachments`, `text`, `style`, `dir`, `fields`
	 *
	 * * **Methods** `attach()`, `formatForNodemailer()`, static `from()`
	 *
	 * ### Target
	 *
	 * * **Methods** `add()`, `addObject()`, `formatForNodemailer()`, `toString()`, static `from()`
	 *
	 * ### Message
	 *
	 * * **Properties** `body`, `time`, `from`, `to`, `dir`, `attachments`
	 *
	 * * **Methods** `attach()`, static `from()`
	 *
	 * ### MailDB
	 *
	 * * **Methods** `transform()`, `loadFromReference()`, static `findNestedElement()`
	 *
	 * ### createMailer
	 *
	 * Returns a Nodemailer transport.
	 * @param {object} trasportConfig The nodemailer config
	 *
	 * ### mail
	 *
	 * Sends a composed email.
	 * @param {Email} email Email instance
	 * @param {object} data Data to fill placeholders
	 * @param {object} opts Options like mailer and htmlEol
	 */
	it('All exported symbols are defined', () => {
		assert.ok(Address)
		assert.ok(Attachment)
		assert.ok(Email)
		assert.ok(MailDB)
		assert.ok(Message)
		assert.ok(Target)
		assert.ok(createMailer)
		assert.ok(mail)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, './types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 * Run a quick experiment.
	 */
	it('How to run the playground script?', async () => {
		assert.ok(String(pkg.scripts?.playground))
		const response = await runSpawn('node', ['-e', "console.log('ok')"])
		assert.equal(response.code, 0)
		assert.ok(response.text.trim() === 'ok')
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [CONTRIBUTING.md](./CONTRIBUTING.md)', async () => {
		assert.ok(fs)
		const text = await fs.loadDocument('CONTRIBUTING.md')
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to use license? - [LICENSE](./LICENSE)', async () => {
		assert.ok(fs)
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const saved = await fs.loadDocument('README.md')
		assert.ok(saved.includes('## API reference'))
	})
})
