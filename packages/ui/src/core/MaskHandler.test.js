import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MaskHandler } from './MaskHandler.js'

describe('MaskHandler', () => {
	it('formats phone with +38 prefix automatically', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		assert.equal(mh.formatted, '+38 (___) ___ ____')
		assert.equal(mh.isComplete, false)

		mh.input('0')
		assert.equal(mh.formatted, '+38 (0__) ___ ____')

		mh.input('6')
		mh.input('6')
		assert.equal(mh.formatted, '+38 (066) ___ ____')

		mh.input('0')
		mh.input('8')
		mh.input('4')
		mh.input('8')
		mh.input('4')
		mh.input('0')
		mh.input('4')
		assert.equal(mh.formatted, '+38 (066) 084 8404')
		assert.equal(mh.isComplete, true)
	})

	it('setValue strips mask prefix from full number', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		mh.setValue('+380660848404')
		assert.equal(mh.formatted, '+38 (066) 084 8404')
		assert.equal(mh.isComplete, true)
	})

	it('setValue handles raw digits without prefix', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		mh.setValue('0660848404')
		assert.equal(mh.formatted, '+38 (066) 084 8404')
		assert.equal(mh.isComplete, true)
	})

	it('handles backspace', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		mh.input('0')
		mh.input('6')
		assert.equal(mh.formatted, '+38 (06_) ___ ____')
		mh.backspace()
		assert.equal(mh.formatted, '+38 (0__) ___ ____')
	})

	it('rejects non-alnum characters', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		assert.equal(mh.input('+'), false)
		assert.equal(mh.input('('), false)
		assert.equal(mh.input(' '), false)
		assert.equal(mh.raw, '')
	})

	it('rejects input when full', () => {
		const mh = new MaskHandler('999')
		mh.input('1')
		mh.input('2')
		mh.input('3')
		assert.equal(mh.isComplete, true)
		assert.equal(mh.input('4'), false)
		assert.equal(mh.formatted, '123')
	})

	it('works with card number mask', () => {
		const mh = new MaskHandler('9999 9999 9999 9999')
		mh.setValue('1234567812345678')
		assert.equal(mh.formatted, '1234 5678 1234 5678')
		assert.equal(mh.isComplete, true)
	})

	it('works with date mask', () => {
		const mh = new MaskHandler('99/99')
		mh.setValue('1225')
		assert.equal(mh.formatted, '12/25')
		assert.equal(mh.isComplete, true)
	})

	it('slotCount counts only placeholders', () => {
		const mh = new MaskHandler('+38 (099) 999 9999')
		assert.equal(mh._slotCount, 10) // 0,9,9 + 9,9,9 + 9,9,9,9
	})
})
