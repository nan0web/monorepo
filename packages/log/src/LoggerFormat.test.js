import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import LoggerFormat from './LoggerFormat.js'

describe('LoggerFormat', () => {
	it('should create a new LoggerFormat instance with default values', () => {
		const format = new LoggerFormat()
		assert.equal(format.icon, '')
		assert.equal(format.color, '')
		assert.equal(format.bgColor, '')
	})

	it('should create a new LoggerFormat instance with provided values', () => {
		const format = new LoggerFormat({
			icon: '✓',
			color: '\x1b[32m',
			bgColor: '\x1b[41m',
		})
		assert.equal(format.icon, '✓')
		assert.equal(format.color, '\x1b[32m')
		assert.equal(format.bgColor, '\x1b[41m')
	})

	it('should create a LoggerFormat instance from another LoggerFormat instance', () => {
		const original = new LoggerFormat({
			icon: '!',
			color: '\x1b[31m',
		})
		const format = LoggerFormat.from(original)
		assert.equal(format.icon, '!')
		assert.equal(format.color, '\x1b[31m')
		assert.equal(format.bgColor, '')
	})

	it('should create a LoggerFormat instance from an object', () => {
		const format = LoggerFormat.from({
			icon: '∆',
			color: '\x1b[33m',
			bgColor: '\x1b[44m',
		})
		assert.equal(format.icon, '∆')
		assert.equal(format.color, '\x1b[33m')
		assert.equal(format.bgColor, '\x1b[44m')
	})
})
