import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import NoLogger from './NoLogger.js'

suite('NoLogger', () => {
	/** @type {NoLogger} */
	let logger

	describe('log levels', () => {
		it('should log debug messages when level is debug', () => {
			logger = new NoLogger({ level: 'debug' })
			logger.debug('test debug')
			logger.info('test info')
			logger.warn('test warn')
			logger.error('test error')

			const output = logger.output()
			assert.equal(output.length, 4)
			assert.deepStrictEqual(output[0], ['debug', 'test debug'])
			assert.deepStrictEqual(output[1], ['info', 'test info'])
			assert.deepStrictEqual(output[2], ['warn', 'test warn'])
			assert.deepStrictEqual(output[3], ['error', 'test error'])
		})

		it('should not log debug messages when level is info', () => {
			logger = new NoLogger({ level: 'info' })
			logger.debug('test debug')
			logger.info('test info')
			logger.warn('test warn')
			logger.error('test error')

			const output = logger.output()
			assert.equal(output.length, 3)
			assert.deepStrictEqual(output[0], ['info', 'test info'])
			assert.deepStrictEqual(output[1], ['warn', 'test warn'])
			assert.deepStrictEqual(output[2], ['error', 'test error'])
		})

		it('should only log errors when level is error', () => {
			logger = new NoLogger({ level: 'error' })
			logger.debug('test debug')
			logger.info('test info')
			logger.warn('test warn')
			logger.error('test error')

			const output = logger.output()
			assert.equal(output.length, 1)
			assert.deepStrictEqual(output[0], ['error', 'test error'])
		})

		it('should not log anything when level is silent', () => {
			logger = new NoLogger({ level: 'silent' })
			logger.debug('test debug')
			logger.info('test info')
			logger.warn('test warn')
			logger.error('test error')
			logger.log('test log')

			const output = logger.output()
			assert.ok(output.length === 0)
		})
	})

	describe('output handling', () => {
		it('should clear logs when clear is called', () => {
			logger = new NoLogger({ level: 'debug' })
			logger.debug('test debug')
			logger.info('test info')

			assert.equal(logger.output().length, 2)
			logger.console.clear()
			assert.equal(logger.output().length, 0)
		})
	})
})
