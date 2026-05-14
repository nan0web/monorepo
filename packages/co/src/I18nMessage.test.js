import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import I18nMessage from './I18nMessage.js'
import { NoLogger } from '@nan0web/log'

describe('I18nMessage class', () => {
	let originalConsole

	before(() => {
		originalConsole = console
		console = new NoLogger({ level: NoLogger.LEVELS.debug })
	})

	after(() => {
		console = originalConsole
	})

	it('should create instance with default values', () => {
		const msg = new I18nMessage()
		assert.strictEqual(msg.body, undefined)
		assert.ok(msg.time instanceof Date)
	})

	it('should create instance with provided values', () => {
		const body = 'Hello world'
		const time = new Date('2023-01-01')
		const customTranslate = (key) => `Translated: ${key}`

		const msg = new I18nMessage({ body, time, t: customTranslate })

		assert.strictEqual(msg.body, body)
		assert.strictEqual(msg.time.getTime(), time.getTime())
		assert.strictEqual(msg.t('test'), 'Translated: test')
	})

	it('should translate message with parameters', () => {
		const translateFn = (key, params) => {
			if (key === 'greeting') return I18nMessage.Replacer('Hello {{name}}!', params)
			return I18nMessage.Replacer(key, params)
		}

		const msg = new I18nMessage({ t: translateFn })
		const result = msg.t('greeting', { name: 'World' })

		assert.strictEqual(result, 'Hello World!')
	})

	it('should use default replacer when no translate function provided', () => {
		const msg = new I18nMessage()
		const result = msg.t('Hello {{name}}!', { name: 'World' })

		assert.strictEqual(result, 'Hello World!')
	})

	it('should convert to object', () => {
		const body = 'Test message'
		const time = new Date('2023-01-01').getTime()
		const msg = new I18nMessage({ body, time })
		const obj = msg.toObject()

		assert.deepStrictEqual(obj, { body, time })
	})

	it('should convert to string', () => {
		const body = 'Test message'
		const time = new Date('2023-01-01')
		const msg = new I18nMessage({ body, time })
		const str = msg.toString()

		assert.equal(str, '2023-01-01T00:00:00.000Z Test message')
	})

	it('should create from another I18nMessage', () => {
		const original = new I18nMessage({ body: 'test' })
		const returned = I18nMessage.from(original)

		assert.strictEqual(original, returned)
	})

	it('should create new instance from regular input', () => {
		const input = { body: 'test translation' }
		const msg = I18nMessage.from(input)

		assert.ok(msg instanceof I18nMessage)
		assert.strictEqual(msg.body, 'test translation')
	})

	/**
	 * @docs
	 * ## Usage
	 * ### Internationalized Message
	 */
	it('I18nMessages translate keys with parameters', () => {
		// import { I18nMessage } from '@nan0web/co'

		const greeting = new I18nMessage({
			body: 'greeting',
			t: (key, params) => {
				const translations = {
					greeting: 'Hello {{name}}!',
					farewell: 'Goodbye {{name}}!',
				}
				return I18nMessage.Replacer(translations[key] || key, params)
			},
		})

		console.log(greeting.t('greeting', { name: 'World' })) // Hello World!
		assert.equal(greeting.t('greeting', { name: 'World' }), 'Hello World!')
	})
})
