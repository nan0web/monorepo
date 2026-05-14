import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import NoConsole from './NoConsole.js'

describe('NoConsole class functionality', () => {
	it('should store logs in memory instead of outputting them', () => {
		const noConsole = new NoConsole()
		noConsole.debug('debug message')
		noConsole.info('info message')
		noConsole.warn('warn message')
		noConsole.error('error message')
		noConsole.log('log message')

		const logs = noConsole.output()
		assert.equal(logs.length, 5)
		assert.deepEqual(logs[0], ['debug', 'debug message'])
		assert.deepEqual(logs[1], ['info', 'info message'])
		assert.deepEqual(logs[2], ['warn', 'warn message'])
		assert.deepEqual(logs[3], ['error', 'error message'])
		assert.deepEqual(logs[4], ['log', 'log message'])

		const errors = noConsole.output('error')
		assert.deepEqual(errors, [['error', 'error message']])

		const fives = noConsole.output(([t]) => t.length == 5)
		assert.deepEqual(fives, [
			['debug', 'debug message'],
			['error', 'error message'],
		])
	})

	it('should not store logs when silent mode is enabled', () => {
		const console = new NoConsole({ silent: true })
		console.debug('debug message')
		console.info('info message')
		console.warn('warn message')
		console.error('error message')
		console.log('log message')

		const logs = console.output()
		assert.equal(logs.length, 0)
	})

	it('should clear all stored logs', () => {
		const noConsole = new NoConsole()
		noConsole.debug('debug message')
		noConsole.info('info message')
		assert.equal(noConsole.output().length, 2)

		noConsole.clear()
		assert.equal(noConsole.output().length, 0)
	})

	it('should resolve or create NoConsole with the Factory from()', () => {
		const a = new NoConsole()
		const b = NoConsole.from(a)
		const c = NoConsole.from({})
		assert.ok(a === b)
		assert.ok(a == b)
		assert.ok(c !== a)
		assert.ok(c !== b)
		assert.ok(c != a)
		assert.ok(c != b)
	})

	it('should handle optional console methods without throwing', () => {
		const noConsole = new NoConsole()
		assert.doesNotThrow(() => noConsole.assert(true))
		assert.doesNotThrow(() => noConsole.count())
		assert.doesNotThrow(() => noConsole.countReset())
		assert.doesNotThrow(() => noConsole.dir({}))
		assert.doesNotThrow(() => noConsole.dirxml({}))
		assert.doesNotThrow(() => noConsole.group())
		assert.doesNotThrow(() => noConsole.groupCollapsed())
		assert.doesNotThrow(() => noConsole.groupEnd())
		assert.doesNotThrow(() => noConsole.profile('test'))
		assert.doesNotThrow(() => noConsole.profileEnd('test'))
		assert.doesNotThrow(() => noConsole.time('test'))
		assert.doesNotThrow(() => noConsole.timeStamp('test'))
		assert.doesNotThrow(() => noConsole.timeEnd('test'))
		assert.doesNotThrow(() => noConsole.timeLog('test'))
		assert.doesNotThrow(() => noConsole.table([]))
		assert.doesNotThrow(() => noConsole.trace())
	})
})
