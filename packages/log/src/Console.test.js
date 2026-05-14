import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import Console from './Console.js'

test('Console class functionality', async (t) => {
	await t.test('should create a console instance with default console', () => {
		const consoleInstance = new Console()
		assert.ok(consoleInstance.console)
	})

	await t.test('should create a console instance with custom console', () => {
		const mockConsole = {
			log: () => {},
			info: () => {},
			warn: () => {},
			error: () => {},
			debug: () => {},
		}
		const consoleInstance = new Console({ console: mockConsole })
		assert.equal(consoleInstance.console, mockConsole)
	})

	await t.test('should call underlying console methods', () => {
		const methods = ['log', 'info', 'warn', 'error', 'debug']
		for (const method of methods) {
			const mockConsole = {}
			mockConsole[method] = (...args) => {
				mockConsole.lastCall = { method, args }
			}
			const consoleInstance = new Console({ console: mockConsole })
			consoleInstance[method]('test', 123)
			assert.equal(mockConsole.lastCall.method, method)
			assert.deepEqual(mockConsole.lastCall.args, ['test', 123])
		}
	})

	await t.test('should handle optional console methods', () => {
		const consoleInstance = new Console({ console: {} })
		assert.doesNotThrow(() => consoleInstance.clear())
		assert.doesNotThrow(() => consoleInstance.assert(true))
		assert.doesNotThrow(() => consoleInstance.count())
		assert.doesNotThrow(() => consoleInstance.countReset())
		assert.doesNotThrow(() => consoleInstance.dir({}))
		assert.doesNotThrow(() => consoleInstance.dirxml({}))
		assert.doesNotThrow(() => consoleInstance.group())
		assert.doesNotThrow(() => consoleInstance.groupCollapsed())
		assert.doesNotThrow(() => consoleInstance.groupEnd())
		assert.doesNotThrow(() => consoleInstance.profile('test'))
		assert.doesNotThrow(() => consoleInstance.profileEnd('test'))
		assert.doesNotThrow(() => consoleInstance.time('test'))
		assert.doesNotThrow(() => consoleInstance.timeStamp('test'))
		assert.doesNotThrow(() => consoleInstance.timeEnd('test'))
		assert.doesNotThrow(() => consoleInstance.timeLog('test'))
		assert.doesNotThrow(() => consoleInstance.table([]))
		assert.doesNotThrow(() => consoleInstance.trace())
	})

	// Additional tests to improve coverage
	await t.test('should profile with label', () => {
		const mockConsole = {
			profile: (label) => {
				mockConsole.profileCalledWith = label
			},
			profileEnd: (label) => {
				mockConsole.profileEndCalledWith = label
			},
		}
		const consoleInstance = new Console({ console: mockConsole })

		consoleInstance.profile('test')
		assert.equal(mockConsole.profileCalledWith, 'test')

		consoleInstance.profileEnd('test')
		assert.equal(mockConsole.profileEndCalledWith, 'test')
	})
})
