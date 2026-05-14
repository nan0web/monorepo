import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { NoLogger } from '@nan0web/log'
import Message from './Message.js'

class ParseBody {
	static help = {
		help: 'Show help',
	}
	/** @type {boolean} */
	help = false

	static fail = {
		help: 'Filter only failed tests',
		alias: 'f',
	}
	/** @type {boolean} */
	fail = false

	static skip = {
		help: 'Filter only skipped tests',
		alias: 's',
	}
	/** @type {boolean} */
	skip = false

	static todo = {
		help: 'Filter only todo tests',
		alias: 'd',
	}
	/** @type {boolean} */
	todo = false

	static format = {
		help: 'Output format: txt, md, html',
		options: ['txt', 'md', 'html'],
		defaultValue: 'txt',
	}
	/**
	 * Todo output format.
	 * One of txt, md, html.
	 * @type {string}
	 */
	format

	static title = {
		help: 'Title of the subject',
		pattern: /^[a-z]+$/,
		defaultValue: '',
	}
	/** @type {string} */
	title

	constructor(input = {}) {
		const {
			help = this.help,
			fail = this.fail,
			skip = this.skip,
			todo = this.todo,
			format = this.format,
		} = Message.parseBody(input, ParseBody)
		this.help = Boolean(help)
		this.fail = Boolean(fail)
		this.skip = Boolean(skip)
		this.todo = Boolean(todo)
		this.format = String(format)
	}
	/**
	 * @param {Partial<ParseBody>} input
	 * @returns {ParseBody}
	 */
	static from(input) {
		if (input instanceof ParseBody) return input
		return new ParseBody(input)
	}
}

class ParseMessage extends Message {
	static Body = ParseBody
	/** @type {ParseBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = ParseBody.from(input.body ?? {})
	}
}

class PatternRequiredBody {
	/** @type {string} */
	name
	static name = {
		help: 'Name must be lowercase letters only',
		pattern: /^[a-z]+$/,
		required: true,
		defaultValue: '',
	}

	/** @type {string} */
	title
	static title = {
		help: 'Title must be at least 3 characters',
		pattern: /^.{3,}$/,
		defaultValue: '',
	}

	/**
	 * @param {Partial<PatternRequiredBody>}
	 */
	constructor(input = {}) {
		const {
			name = PatternRequiredBody.name.defaultValue,
			title = PatternRequiredBody.title.defaultValue,
		} = Message.parseBody(input, PatternRequiredBody)
		this.name = String(name)
		this.title = String(title)
	}
}

class PatternRequiredMessage extends Message {
	static Body = PatternRequiredBody
	/** @type {PatternRequiredBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = new PatternRequiredBody(input.body ?? {})
	}
}

describe('Message class', () => {
	let originalConsole
	before(() => {
		originalConsole = console
		console = new NoLogger({ level: NoLogger.LEVELS.debug })
	})
	after(() => {
		console = originalConsole
	})
	it('should create instance with default values', () => {
		const msg = new Message()
		assert.strictEqual(msg.body, undefined)
		assert.ok(msg.time > 0)
	})

	it('should create instance with provided values', () => {
		const body = 'Hello world'
		const time = 1700000000000
		const msg = new Message({ body, time })

		assert.strictEqual(msg.body, body)
		assert.strictEqual(msg.time.getTime(), time)
	})

	it('should convert to object', () => {
		const body = 'Test message'
		const time = 1700000000000
		const msg = new Message({ body, time })
		const obj = msg.toObject()

		assert.deepStrictEqual(obj, { body, time })
	})

	it('should convert to string', () => {
		const body = 'Test message'
		const time = 1700000000000
		const msg = new Message({ body, time })
		const str = msg.toString()

		assert.ok(str.startsWith('2023-11-14T22:13:20'))
		assert.ok(str.endsWith(body))
	})

	it('should create from string input', () => {
		const body = 'Direct string input'
		const msg = Message.from(body)

		assert.ok(msg instanceof Message)
		assert.strictEqual(msg.body, body)
	})

	it('should return same instance when from receives Message', () => {
		const original = new Message({ body: 'test' })
		const returned = Message.from(original)

		assert.strictEqual(original, returned)
	})
	it('should contain body and time when they were created', () => {
		const msg = Message.from('Hello world')
		console.log(String(msg)) // 2023-04-01T10:00:00 Hello world
		assert.equal(String(msg), msg.time.toISOString() + ' Hello world')
	})
	it('should show errors for invalid schema', () => {
		class Body {
			/** @type {string} */
			name
			static name = {
				validate: (name) => (name.length < 3 ? 'Too short' : true),
			}

			/** @type {Date} */
			birthday
			static birthday = {
				/**
				 * @param {Date} b
				 * @returns {string | true}
				 */
				validate: (b) => (new Date(b).getFullYear() < 1930 ? 'Too old' : true),
			}
			/**
			 * @param {Patial<Schema>} input
			 */
			constructor(input = {}) {
				const { name = '', birthday = new Date() } = input
				this.name = String(name)
				this.birthday = new Date(birthday)
			}
		}
		class ValidMessage extends Message {
			static Body = Body
			/** @type {Schema} */
			body
			/**
			 * @param {Partial<ValidMessage>} input
			 */
			constructor(input = {}) {
				super(input)
				this.body = new Body(input.body ?? {})
			}
		}
		const msg = new ValidMessage({ body: { name: 'I' } })
		const errors = msg.getErrors()
		assert.deepStrictEqual(errors, { name: ['Too short'] })
		assert.equal(msg.isValid, false)

		const old = new ValidMessage({ body: { name: 'John', birthday: '1910-10-01' } })
		const errors2 = old.getErrors()
		assert.deepStrictEqual(errors2, { birthday: ['Too old'] })
		assert.equal(old.isValid, false)
	})

	it('should parse body by default', () => {
		const msg = new ParseMessage({ body: { skip: 1 } })
		assert.deepStrictEqual(
			{ ...msg.body },
			{
				format: 'txt',
				title: undefined,
				fail: false,
				help: false,
				skip: true,
				todo: false,
			},
		)
	})

	it('should throw a message on invalid input', () => {
		assert.throws(() => {
			new ParseMessage({ body: { skip: 1, format: 'invalid' } })
		}, new TypeError('Enumeration must have one value of\n- txt\n- md\n- html\nbut provided\ninvalid'))
	})

	it('should validate ParseBody fields correctly (valid data)', () => {
		const msg = new ParseMessage()
		const result = msg.validate()
		assert.equal(result.size, 0, 'body should be valid')
	})

	it('should validate ParseBody fields correctly (valid data)', () => {
		const msg = new ParseMessage({ body: { title: '123' } })
		const result = msg.validate()
		assert.equal(result.size, 0, 'body should be valid')
	})

	it('should report pattern mismatch error', () => {
		const msg = new PatternRequiredMessage({ body: { name: 'JohnDoe' } })
		const result = msg.validate()
		assert.equal(result.size, 2)
		assert.equal(result.get('name'), 'Does not match pattern /^[a-z]+$/')
		assert.equal(result.get('title'), 'Does not match pattern /^.{3,}$/')
	})

	it('should report required field missing error', () => {
		const msg = new PatternRequiredMessage({ body: {} })
		const result = msg.validate()
		assert.equal(result.size, 2)
		assert.strictEqual(result.get('name'), 'Required')
		assert.strictEqual(result.get('title'), 'Does not match pattern /^.{3,}$/')
	})

	it('should report enum validation error with correct message', () => {
		// ParseMessage constructor already throws on invalid enum, but we test validate() on a custom schema
		class EnumBody {
			/** @type {string} */
			mode

			static mode = {
				help: 'Mode selection',
				options: ['auto', 'manual'],
				defaultValue: 'auto',
			}
			constructor(input = {}) {
				const { mode = EnumBody.mode.defaultValue } = Message.parseBody(input, EnumBody)
				this.mode = String(mode)
			}
		}
		class EnumMessage extends Message {
			static Body = EnumBody
			/** @type {EnumBody} */
			body
			constructor(input = {}) {
				super(input)
				this.body = new EnumBody(input.body ?? {})
			}
		}
		const msg = new EnumMessage()
		// Since parseBody throws on invalid enum, we need to bypass it:
		// Directly assign invalid value to trigger validation error for test purposes
		msg.body.mode = 'invalid'
		const res = msg.validate()
		assert.equal(res.size, 1)
		assert.equal(res.get('mode'), 'Enumeration must have one value')
	})
})
