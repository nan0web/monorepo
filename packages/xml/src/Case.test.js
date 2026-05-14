import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Case from './Case.js'

describe('Case', () => {
	it('transform - camel', () => {
		assert.equal(Case.transform('my_string-value', Case.CAMEL), 'myStringValue')
	})

	it('transform - kebab', () => {
		assert.equal(Case.transform('myStringValue', Case.KEBAB), 'my-string-value')
	})

	it('transform - snake', () => {
		assert.equal(Case.transform('myStringValue', Case.SNAKE), 'my_string_value')
	})

	it('transform - pascal', () => {
		assert.equal(Case.transform('my-string-value', Case.PASCAL), 'MyStringValue')
	})

	it('transform - upper', () => {
		assert.equal(Case.transform('myString', Case.UPPER), 'MYSTRING')
	})

	it('transform - lower', () => {
		assert.equal(Case.transform('MyString', Case.LOWER), 'mystring')
	})
})
