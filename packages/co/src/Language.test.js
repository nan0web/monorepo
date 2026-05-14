import { describe, it } from 'node:test'
import assert from 'node:assert'
import Language from './Language.js'

describe('Language class', () => {
	it('should create instance with default values', () => {
		const lang = new Language()
		assert.strictEqual(lang.name, '')
		assert.strictEqual(lang.icon, '')
		assert.strictEqual(lang.code, '')
		assert.strictEqual(lang.locale, '')
	})

	it('should create instance with provided values', () => {
		const input = {
			name: 'English',
			icon: '🇬🇧',
			code: 'en',
			locale: 'en-US',
		}
		const lang = new Language(input)

		assert.strictEqual(lang.name, input.name)
		assert.strictEqual(lang.icon, input.icon)
		assert.strictEqual(lang.code, input.code)
		assert.strictEqual(lang.locale, input.locale)
	})

	it('should handle string conversion properly', () => {
		const lang = new Language({
			name: 'Українська',
			icon: '🇺🇦',
			code: 'uk',
			locale: 'uk-UA',
		})

		// Since there's no custom toString method, it will use the default object toString
		const str = lang.toString()
		assert.ok(str.includes('Українська 🇺🇦'))
	})

	it('should return same instance with from when input is Language', () => {
		const original = new Language({ code: 'fr', name: 'Français' })
		const returned = Language.from(original)

		assert.strictEqual(original, returned)
	})

	it('should create new instance with from when input is object', () => {
		const input = { code: 'es', name: 'Español', locale: 'es-ES' }
		const lang = Language.from(input)

		assert.ok(lang instanceof Language)
		assert.strictEqual(lang.code, input.code)
		assert.strictEqual(lang.name, input.name)
		assert.strictEqual(lang.locale, input.locale)
	})

	it('should handle ISO 639-1 language codes', () => {
		const languages = [
			{ code: 'en', name: 'English', locale: 'en-US' },
			{ code: 'uk', name: 'Українська', locale: 'uk-UA' },
			{ code: 'fr', name: 'Français', locale: 'fr-FR' },
			{ code: 'de', name: 'Deutsch', locale: 'de-DE' },
			{ code: 'es', name: 'Español', locale: 'es-ES' },
			{ code: 'ja', name: '日本語', locale: 'ja-JP' },
			{ code: 'zh', name: '中文', locale: 'zh-CN' },
		]

		for (const langData of languages) {
			const lang = new Language(langData)
			assert.strictEqual(lang.code, langData.code)
			assert.strictEqual(lang.name, langData.name)
			assert.strictEqual(lang.locale, langData.locale)
		}
	})

	it('should handle empty input in constructor', () => {
		const lang = new Language({})

		assert.strictEqual(lang.name, '')
		assert.strictEqual(lang.icon, '')
		assert.strictEqual(lang.code, '')
		assert.strictEqual(lang.locale, '')
	})
})
