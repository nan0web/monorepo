import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createT } from '@nan0web/i18n'
import { DB } from '@nan0web/db'
import { IntentAuditor } from './IntentAuditor.js'
import { JsIntentAuditor } from './JsIntentAuditor.js'
import { PyIntentAuditor } from './PyIntentAuditor.js'

describe('IntentAuditor Polymorphic Suite', () => {
	const t = createT({})

	describe('JsIntentAuditor', () => {
		it('detects console.log statements', () => {
			const content = `
				export class TestModel {
					run() {
						console.log("dirty log");
					}
				}
			`
			const errors = JsIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 1)
			assert.match(errors[0], /Found direct system write "console.log\(/)
		})

		it('detects console helpers like table, trace, and assert', () => {
			const content = `
				console.table(users);
				console.trace();
				console.assert(x > 0);
			`
			const errors = JsIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 3)
			assert.match(errors[0], /Found direct system write "console.table\(/)
			assert.match(errors[1], /Found direct system write "console.trace\(/)
			assert.match(errors[2], /Found direct system write "console.assert\(/)
		})

		it('detects process.stdout.write and process.stderr.write', () => {
			const content = `
				process.stdout.write("direct");
				process.stderr.write("error");
			`
			const errors = JsIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 2)
			assert.match(errors[0], /Found direct process write "process.stdout.write\(/)
			assert.match(errors[1], /Found direct process write "process.stderr.write\(/)
		})

		it('ignores console and process writes inside comments', () => {
			const content = `
				// console.log("commented log");
				/* console.warn("commented warn"); */
				* console.error("commented block log");
			`
			const errors = JsIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 0)
		})
	})

	describe('PyIntentAuditor', () => {
		it('detects Python print(...) statements', () => {
			const content = `
def process_data(data):
	print("Processing data")
	return data
			`
			const errors = PyIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 1)
			assert.match(errors[0], /Found direct print statement "print\(\.\.\.\)"/)
		})

		it('detects Python sys.stdout.write and sys.stderr.write', () => {
			const content = `
import sys
sys.stdout.write("direct")
sys.stderr.write("error")
			`
			const errors = PyIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 2)
			assert.match(errors[0], /Found direct system stream write "sys.stdout.write\(/)
			assert.match(errors[1], /Found direct system stream write "sys.stderr.write\(/)
		})

		it('ignores print and writes inside Python comments (#)', () => {
			const content = `
# print("python commented print")
# sys.stdout.write("commented")
			`
			const errors = PyIntentAuditor.inspectFileContent(content, t)
			assert.equal(errors.length, 0)
		})
	})

	describe('IntentAuditor Polymorphic Delegation', () => {
		it('delegates to PyIntentAuditor on python platform', async () => {
			const db = new DB({ predefined: [
				['src/model.py', 'print("dirty print")']
			] })
			await db.connect()

			const auditor = new IntentAuditor({
				dir: 'src',
				platform: 'python'
			}, { db })

			const intents = []
			for await (const intent of auditor.run()) {
				intents.push(intent)
			}

			// Must yield the audit starting, error, and done error status
			assert.ok(intents.length > 0)
			const hasLeakError = intents.some(intent => 
				intent.type === 'show' && 
				typeof intent.message === 'string' &&
				intent.message.includes('Leak') &&
				intent.message.includes('print(...)')
			)
			assert.ok(hasLeakError, 'Must detect print statement via PyIntentAuditor delegate')
		})

		it('delegates to JsIntentAuditor on js platform', async () => {
			const db = new DB({ predefined: [
				['src/model.js', 'console.log("dirty console")']
			] })
			await db.connect()

			const auditor = new IntentAuditor({
				dir: 'src',
				platform: 'js'
			}, { db })

			const intents = []
			for await (const intent of auditor.run()) {
				intents.push(intent)
			}

			assert.ok(intents.length > 0)
			const hasLeakError = intents.some(intent => 
				intent.type === 'show' && 
				typeof intent.message === 'string' &&
				intent.message.includes('Leak') &&
				intent.message.includes('console.log(')
			)
			assert.ok(hasLeakError, 'Must detect console statement via JsIntentAuditor delegate')
		})
	})
})
