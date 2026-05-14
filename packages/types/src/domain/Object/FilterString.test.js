import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import FilterString from './FilterString.js'

describe('FilterString', () => {
	it('inIncludes method', () => {
		const str = new FilterString('hello world')
		assert.equal(str.inIncludes('hello'), true)
		assert.equal(str.inIncludes('world'), true)
		assert.equal(str.inIncludes('test'), false)
		assert.equal(str.inIncludes('hello', 'test'), true)
		assert.equal(str.inIncludes('test', 'hello'), true)
		assert.equal(str.inIncludes('foo', 'bar', 'world'), true)
		assert.equal(str.inIncludes('foo', 'bar', 'baz'), false)
	})

	it('inStarts method', () => {
		const str = new FilterString('hello world')
		assert.equal(str.inStarts('hello'), true)
		assert.equal(str.inStarts('world'), false)
		assert.equal(str.inStarts('test'), false)
		assert.equal(str.inStarts('hello', 'test'), true)
		assert.equal(str.inStarts('test', 'hello'), true)
		assert.equal(str.inStarts('foo', 'bar', 'hello'), true)
		assert.equal(str.inStarts('foo', 'bar', 'baz'), false)
	})

	it('inEnds method', () => {
		const str = new FilterString('hello world')
		assert.equal(str.inEnds('world'), true)
		assert.equal(str.inEnds('hello'), false)
		assert.equal(str.inEnds('test'), false)
		assert.equal(str.inEnds('world', 'test'), true)
		assert.equal(str.inEnds('test', 'world'), true)
		assert.equal(str.inEnds('foo', 'bar', 'world'), true)
		assert.equal(str.inEnds('foo', 'bar', 'baz'), false)
	})

	it('trimEnd method', () => {
		const str1 = new FilterString('hello world   \n\t')
		assert.equal(str1.trimEnd(), 'hello world')

		const str2 = new FilterString('hello world...')
		assert.equal(str2.trimEnd('.'), 'hello world')

		const str3 = new FilterString('hello world')
		assert.equal(str3.trimEnd('test'), 'hello world')

		const str4 = new FilterString('test')
		assert.equal(str4.trimEnd('test'), '')
	})

	it('trimStart method', () => {
		const str1 = new FilterString('   \n\t hello world')
		assert.equal(str1.trimStart(), 'hello world')

		const str2 = new FilterString('...hello world')
		assert.equal(str2.trimStart('.'), 'hello world')

		const str3 = new FilterString('hello world')
		assert.equal(str3.trimStart('test'), 'hello world')

		const str4 = new FilterString('test')
		assert.equal(str4.trimStart('test'), '')
	})

	it('trim method', () => {
		const str1 = new FilterString('   \n\t hello world   \n\t')
		assert.equal(str1.trim(), 'hello world')

		const str2 = new FilterString('...hello world...')
		assert.equal(str2.trim('.'), 'hello world')

		const str3 = new FilterString('hello world')
		assert.equal(str3.trim('test'), 'hello world')

		const str4 = new FilterString('test')
		assert.equal(str4.trim('test'), '')

		const str5 = new FilterString('hello world...')
		assert.equal(str5.trim('.'), 'hello world')
	})

	it('empty chars handling', () => {
		const str = new FilterString('test')
		assert.equal(str.trimEnd(''), 'test')
		assert.equal(str.trimStart(''), 'test')
		assert.equal(str.trim(''), 'test')
	})
})
