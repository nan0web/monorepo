import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { to } from '@nan0web/types'
import HumanGender from './Gender.js'
import HumanName from './Name.js'

describe('HumanGender', () => {
	it('should parse gender from name', () => {
		assert.equal(to(Number)(HumanGender.parse('Петруненко Ярослав')), 1)
		assert.equal(to(Number)(HumanGender.parse('Петруненко Володимир Васильович')), 1)
		assert.equal(to(Number)(HumanGender.parse('Василь Петруненко')), 1)
		assert.equal(to(Number)(HumanGender.parse('Петро')), 1)
		assert.equal(to(Number)(HumanGender.parse('Людмила Петруненко')), 0)
		assert.equal(to(Number)(HumanGender.parse('Петруненко Людмила Василівна')), 0)
		assert.equal(to(Number)(HumanGender.parse('Людмила')), 0)
	})

	it('should parse gender from custom name lists when Name is overridden', () => {
		class CustomHumanName extends HumanName {}
		CustomHumanName.MEN = ['Alex']
		CustomHumanName.WOMEN = ['Alexa']
		CustomHumanName.ALIASES = []

		class CustomHumanGender extends HumanGender {}
		CustomHumanGender.Name = CustomHumanName

		assert.equal(to(Number)(CustomHumanGender.parse('Alex')), 1)
		assert.equal(to(Number)(CustomHumanGender.parse('Alexa')), 0)
	})

	it('should return unknown gender for names not in lists', () => {
		assert.equal(to(Number)(HumanGender.parse('UnknownName')), -1)
	})

	it('should handle empty or invalid string input', () => {
		assert.equal(to(Number)(HumanGender.parse('')), -1)
		assert.equal(to(Number)(HumanGender.parse('-')), -1)
		assert.equal(to(Number)(HumanGender.parse('-1')), -1)
	})

	it('should parse numeric string inputs', () => {
		assert.equal(to(Number)(HumanGender.parse('1')), 1)
		assert.equal(to(Number)(HumanGender.parse('0')), 0)
	})
})
