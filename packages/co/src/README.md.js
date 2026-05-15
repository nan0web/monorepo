import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import { Chat, Contact, Language, Message, InputMessage, OutputMessage, App } from './index.js'
import { readFile } from 'node:fs/promises'

const fs = new FS()
let pkg

before(async () => {
	pkg = await fs.loadDocument('package.json', {})
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

function docs() {
	/**
	 * @docs
	 * # @nan0web/co
	 *
	 * Communication starts here with a simple Message.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/co` package provides a minimal yet powerful foundation for
	 * message‑based communication systems and contact handling.
	 *
	 * Core classes:
	 *
	 * - `Message` — a base class for representing generic messages with timestamps.
	 * - `Chat` — represents chat messages and chains.
	 * - `Contact` — parses and represents contact information with specific URI schemes.
	 * - `Language` — handles localisation data including name, icon, code and locale.
	 * - `I18nMessage` — extends `Message` with translation support.
	 * - `InputMessage` / `OutputMessage` — UI‑oriented message adapters.
	 * - `App` — minimal event‑driven application core.
	 *
	 * Use `@nan0web/ui-cli` for CLI‑specific commands (e.g. parsing `process.argv` to Messages).
	 *
	 * These classes are perfect for building parsers,
	 * communication protocols, message validation layers,
	 * and contact or language data management.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/co')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/co')
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/co
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/co')
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Message
	 *
	 * Messages contain body and time when they were created.
	 */
	it('How to create a Message instance from string?', () => {
		//import { Message } from '@nan0web/co'
		const msg = Message.from('Hello world')
		console.info(String(msg)) // 2023-04-01T10:00:00 Hello world
		assert.deepStrictEqual(console.output(), [['info', msg.time.toISOString() + ' Hello world']])
	})

	/**
	 * @docs
	 * Messages can be restored from old timestamp.
	 */
	it('How to create a Message instance from object?', () => {
		//import { Message } from '@nan0web/co'
		const msg = Message.from({ body: 'Hello 2000', time: new Date('2000-01-01') })
		console.info(String(msg)) // 2000-01-01T00:00:00.000Z Hello 2000
		assert.deepStrictEqual(console.output(), [['info', '2000-01-01T00:00:00.000Z Hello 2000']])
	})

	/**
	 * @docs
	 * ### Chat Messages
	 *
	 * Chat creates a message chain with authors.
	 */
	it('How to create a message chain with authors in a chat?', () => {
		const alice = Contact.from('alice@example.com')
		const bob = Contact.from('+1234567890')

		const chat = new Chat({
			author: alice,
			body: 'Hi Bob!',
			next: new Chat({
				author: bob,
				body: 'Hello Alice!',
			}),
		})

		console.info(String(chat))
		// 2025-11-12T11:02:37.033Z mailto:alice@example.com
		// Hi Bob!
		// ---
		// 2025-11-12T11:02:37.033Z tel:+1234567890
		// Hello Alice!
		assert.ok(console.output()[0][1].includes(' mailto:alice@example.com\nHi Bob!\n---\n'))
		assert.ok(console.output()[0][1].includes(' tel:+1234567890\nHello Alice!'))
	})

	/**
	 * @docs
	 * ### Contact Handling
	 *
	 * Contact handles different URIs and string inputs properly.
	 */
	it('How to create contact with different URIs and string inputs properly?', () => {
		// Create direct instances
		const email = new Contact({ type: Contact.EMAIL, value: 'test@example.com' })
		const phone = Contact.from('+123456') // Auto-detected as telephone
		const address = Contact.parse('123 Main St') // Auto-detected as address

		// Parse types
		console.info(email.toString()) // "mailto:test@example.com"
		console.info(phone.toString()) // "tel:+123456"
		console.info(address.toString()) // "address:123 Main St"

		// Auto-detect from strings
		const website = Contact.parse('https://example.com') // Auto-detected as URL
		console.info(website) // "https://example.com"
		assert.strictEqual(console.output()[0][1].toString(), 'mailto:test@example.com')
		assert.strictEqual(console.output()[1][1].toString(), 'tel:+123456')
		assert.strictEqual(console.output()[2][1].toString(), 'address:123 Main St')
		assert.strictEqual(console.output()[3][1].type, Contact.URL)
		assert.strictEqual(console.output()[3][1].value, 'https://example.com')
	})

	/**
	 * @docs
	 * ### Language Handling
	 *
	 * Language handles ISO codes and string conversion.
	 */
	it('How to create a Language instance?', () => {
		const lang = new Language({
			name: 'English',
			icon: '🇬🇧',
			code: 'en',
			locale: 'en-US',
		})
		console.info(String(lang)) // ← English 🇬🇧
		assert.equal(console.output()[0][1], 'English 🇬🇧')
	})

	/**
	 * @docs
	 * ### InputMessage & OutputMessage usage
	 */
	it('How to use InputMessage and OutputMessage?', () => {
		//import { InputMessage, OutputMessage } from "@nan0web/co"
		const inMsg = new InputMessage({ value: 'user input', options: ['yes', 'no'] })
		const outMsg = new OutputMessage({
			content: ['Result:', 'Success'],
			type: OutputMessage.TYPES.SUCCESS,
		})
		console.info(inMsg.toString()) // ← TIMESTAMP user input
		console.info(outMsg.content) // ← ["Result:", "Success"]
		assert.ok(console.output()[0][1].includes('user input'))
		assert.deepStrictEqual(console.output()[1][1], ['Result:', 'Success'])
	})

	/**
	 * @docs
	 * ### App core example
	 */
	it('How to use the App core class?', async () => {
		//import { App } from "@nan0web/co"
		const app = new App()
		const im = new app.InputMessage({ value: 'ping' })
		const gen = app.run(im)
		const { value, done } = await gen.next()
		const { done: done2 } = await gen.next()
		console.info(value) // ← OutputMessage { body: ["Run"], ... }
		console.info(done) // ← false
		console.info(done2) // ← true
		assert.ok(console.output()[0][1] instanceof app.OutputMessage)
		assert.equal(console.output()[1][1], false)
		assert.equal(console.output()[2][1], true)
	})

	/**
	 * @docs
	 * ### Message body parsing with static meta configuration
	 *
	 * The `Message.parseBody` method can transform raw input objects into a
	 * well‑defined body using a static schema.  Below is a concise example
	 * that mirrors the test suite’s `ParseBody` definition.
	 *
	 * The test ensures the parsing behaves exactly as described.
	 */
	it('How to parse a message body using Message.parseBody()?', () => {
		//import { Message } from "@nan0web/co"
		const Body = {
			// Show help flag (alias: h)
			help: { alias: 'h', defaultValue: false },

			// Output format (alias: fmt)
			format: { alias: 'fmt', defaultValue: 'txt', options: ['txt', 'md', 'html'] },

			// Verbose flag (no alias)
			verbose: { defaultValue: false },
		}
		const raw = { h: true, fmt: 'md', verbose: 1 }
		const parsed = Message.parseBody(raw, Body)
		console.info(parsed)
		// { help: true, format: "md", verbose: true }
		assert.deepStrictEqual(console.output()[0][1], { help: true, format: 'md', verbose: true })
	})

	/**
	 * @docs
	 * ### Message validation schema
	 *
	 * `Message` now supports a **static `Body` schema** that can describe:
	 *
	 * - **Aliases** – alternative short keys.
	 * - **Default values** – applied when a field is missing.
	 * - **Required flags** – enforce presence.
	 * - **Pattern matching** – regular‑expression validation.
	 * - **Enumerated options** – restrict values to a set.
	 * - **Custom validation functions** – arbitrary checks returning `true` or an error string.
	 *
	 * Validation is performed by `msg.validate()` returning a `Map<string, string>` of errors,
	 * while `msg.getErrors()` provides the legacy `Record<string, string[]>` format.
	 *
	 * This enables powerful, declarative validation directly on message instances and
	 * increasing quality of IDE autocomplete feature.
	 */
	it('How to validate a message using a custom schema?', () => {
		class MyBody {
			/** @type {string} */
			name
			static name = {
				alias: 'n',
				required: true,
				pattern: /^[a-z]+$/,
			}
			/** @type {string} */
			title
			static title = {
				pattern: /^.{3,}$/,
				defaultValue: '',
			}
			/** @type {string} */
			mode
			static mode = {
				options: ['auto', 'manual'],
				defaultValue: 'auto',
			}
			/** @type {string} */
			custom
			static custom = {
				validate: (v) => (v.length > 5 ? true : 'Too short'),
			}
			constructor(input = {}) {
				const {
					name,
					title = MyBody.title.defaultValue,
					mode = MyBody.mode.defaultValue,
					custom,
				} = Message.parseBody(input, MyBody)
				this.name = String(name)
				this.title = String(title)
				this.mode = String(mode)
				this.custom = String(custom)
			}
		}
		class MyMessage extends Message {
			static Body = MyBody
			/** @type {MyBody} */
			body
			constructor(input = {}) {
				super(input)
				this.body = new MyBody(input.body ?? {})
			}
		}
		const msg = new MyMessage({
			body: { name: 'JohnDoe', title: 'Hello', custom: 'abc' },
		})
		// setting the incorrect enumeration value
		msg.body.mode = 'invalid'
		const errors = msg.validate()
		console.info(errors)
		// Map (3) {
		//   'custom' => 'Too short',
		//   'mode' => 'Enumeration must have one value',
		//   'name' => 'Does not match pattern /^[a-z]+$/',
		// }
		assert.deepStrictEqual(
			console.output()[0][1],
			new Map([
				['name', 'Does not match pattern /^[a-z]+$/'],
				['mode', 'Enumeration must have one value'],
				['custom', 'Too short'],
			]),
		)
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### Message
	 *
	 * * **Properties**
	 *   * `body` – the actual content of the message.
	 *   * `time` – timestamp of creation.
	 *
	 * * **Methods**
	 *   * `toObject()` – returns `{ body, time }`.
	 *   * `toString()` – formats timestamp and body as a string.
	 *   * `static from(input)` – instantiates from string or object.
	 *   * `validate()` – checks body against a static `Body` schema, returns `Map<string, string>`.
	 *   * `getErrors()` – legacy error map, returns `Record<string, string[]>`.
	 *
	 * ### Chat
	 *
	 * Extends `Message`.
	 *
	 * * **Properties**
	 *   * `author` – the contact object representing the message sender.
	 *   * `next` – the next chat message in the chain (nullable).
	 *
	 * * **Methods**
	 *   * `get size` – returns the chain length.
	 *   * `get recent` – returns the last chat message.
	 *   * `toString()` – formats the entire chat chain.
	 *   * `static from(input)` – builds a chat chain from array‑like input.
	 *
	 * ### Contact
	 *
	 * * **Static URI prefixes**
	 *   * `Contact.ADDRESS` – `"address:"`
	 *   * `Contact.EMAIL` – `"mailto:"`
	 *   * `Contact.TELEPHONE` – `"tel:"`
	 *   * `Contact.URL` – `"//"`
	 *   * Social links: FACEBOOK, INSTAGRAM, LINKEDIN, SIGNAL, SKYPE, TELEGRAM, VIBER, WHATSAPP, X
	 *
	 * * **Methods**
	 *   * `toString()` – converts to a URI string.
	 *   * `static parse(string)` – detects a URI scheme or uses heuristics to deduce the type.
	 *   * `static from(input)` – returns a Contact instance if one already exists or creates a new one.
	 *
	 * ### Language
	 *
	 * * **Properties**
	 *   * `name` – language name in its native form.
	 *   * `icon` – flag emoji.
	 *   * `code` – ISO 639‑1 language code.
	 *   * `locale` – specific locale identifier.
	 *
	 * * **Methods**
	 *   * `toString()` – combines `name` and `icon`.
	 *   * `static from(input)` – creates or returns a Language instance.
	 */
	it('All exported classes should pass basic test to ensure API examples work', () => {
		assert.ok(Chat)
		assert.ok(Contact)
		assert.ok(Language)
		assert.ok(Message)
		assert.ok(InputMessage)
		assert.ok(OutputMessage)
		assert.ok(App)
	})

	it('Uses `d.ts` files for autocompletion', () => {
		assert.equal(pkg.types, './types/index.d.ts')
	})

	/**
	 * @docs
	 * ## Playground
	 */
	it('How to run playground script?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/co.git
		 * cd co
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(pkg.scripts?.play)
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, 'git command fails (e.g., not in a git repo)')
		assert.ok(response.text.trim().includes('github-nan0web:nan0web/'))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here]($pkgURL/blob/main/CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')

		const text = await readFile('CONTRIBUTING.md', 'utf-8')
		assert.ok(text.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license? - [ISC LICENSE]($pkgURL/blob/main/LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', docs)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const text = String(parser.decode(docs))
	await fs.saveDocument('README.md', text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered [${Intl.NumberFormat('en-US').format(Buffer.byteLength(text))}b]`, async () => {
		const saved = await readFile('README.md', 'utf-8')
		assert.ok(saved.includes('## License'), 'README was not generated')
	})
})
