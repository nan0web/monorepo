import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { I18nAtom } from './I18nAtom.js'

describe('I18nAtom', () => {
	it('initializes with default empty translations', () => {
		const atom = new I18nAtom()
		assert.deepStrictEqual(atom.translations, {})
		assert.strictEqual(atom.get('uk'), undefined)
		assert.strictEqual(atom.toString(), '')
	})

	it('resolves specific locales correctly', () => {
		const translations = { uk: 'Ярослав', en: 'Yaroslav' }
		const atom = new I18nAtom(translations)

		assert.strictEqual(atom.get('uk'), 'Ярослав')
		assert.strictEqual(atom.get('en'), 'Yaroslav')
	})

	it('falls back to en if requested locale is missing', () => {
		const translations = { en: 'Yaroslav' }
		const atom = new I18nAtom(translations)

		assert.strictEqual(atom.get('uk'), 'Yaroslav')
	})

	it('falls back to the first available translation if requested and en are missing', () => {
		const translations = { da: 'Yaroslav Danish' }
		const atom = new I18nAtom(translations)

		assert.strictEqual(atom.get('uk'), 'Yaroslav Danish')
	})

	it('supports non-string values (any type)', () => {
		const dataUk = ['Ярослав', 'Андрій']
		const dataEn = ['Yaroslav', 'Andriy']
		const atom = new I18nAtom({ uk: dataUk, en: dataEn })

		assert.deepStrictEqual(atom.get('uk'), dataUk)
		assert.deepStrictEqual(atom.get('en'), dataEn)
	})

	it('returns string representation via toString()', () => {
		const atom = new I18nAtom({ uk: 'Ярослав', en: 'Yaroslav' })
		assert.strictEqual(atom.toString(), 'Ярослав')
	})

	it('serializes to JSON correctly via toJSON()', () => {
		const translations = { uk: 'Ярослав', en: 'Yaroslav' }
		const atom = new I18nAtom(translations)
		assert.deepStrictEqual(atom.toJSON(), translations);
	})
})
