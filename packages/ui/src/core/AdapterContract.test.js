/**
 * @file AdapterContract.test — The Judge (Ярослав Мудрий).
 *
 * Verifies that any OLMUI Adapter correctly handles all intent types
 * and respects the yield contract. This test can be run against
 * CLI, Lit, Chat, or any custom adapter.
 *
 * It also verifies:
 * - Timeout behavior (Іван Сірко)
 * - Type safety of responses (Борис Патон)
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateIntent } from './Intent.js'
import { runGenerator } from './GeneratorRunner.js'

// ─── Mock Model for Contract Testing ───

class ContractTestModel {
	// All messages and errors are i18n Model-as-Schema static fields
	static prompt = {
		help: 'Test prompt',
		default: '',
		type: 'text',
		errorEmptyString: 'Must be non-empty string',
		validate: (val) =>
			(typeof val === 'string' && val.length > 0) || ContractTestModel.prompt.errorEmptyString,
	}

	static messages = {
		processing: 'Processing...',
		almostDone: 'Almost done',
	}

	constructor(data = {}) {
		/** @type {string} */
		this.prompt = data.prompt || ContractTestModel.prompt.default
	}

	async *run() {
		// Step 1: Ask for missing data
		if (!this.prompt) {
			const response = yield { type: 'ask', field: 'prompt', schema: ContractTestModel.prompt }
			this.prompt = response.value
		}

		// Step 2: Progress — message from Model static field
		yield { type: 'progress', message: ContractTestModel.messages.processing }

		// Step 3: Show — message from Model static field
		yield { type: 'show', level: 'info', message: ContractTestModel.messages.almostDone }

		// Step 4: Return result
		return { type: 'result', data: { echo: this.prompt } }
	}
}

// ─── Mock Model-as-Schema for Form Testing ───

import { ask, progress, result, isModelSchema } from './Intent.js'

class TransferModel {
	static fromAccount = { help: 'Source account', default: '', options: ['UA001', 'UA002'] }
	static toAccount = { help: 'Destination account', default: '' }
	static amount = {
		help: 'Transfer amount',
		default: 0,
		type: 'number',
		validate: (v) => (v > 0 ? true : 'Amount must be positive'),
	}

	constructor(data = {}) {
		this.fromAccount = data.fromAccount || TransferModel.fromAccount.default
		this.toAccount = data.toAccount || TransferModel.toAccount.default
		this.amount = data.amount || TransferModel.amount.default
	}
}

class TransferFlowModel {
	constructor(data = {}) {
		Object.assign(this, data)
	}
	async *run() {
		/** @type {{ value: TransferModel }} */
		const transfer = yield ask('transfer', TransferModel)
		yield progress('Processing transfer...')
		return result({ txId: 'TX-001', from: transfer.value.fromAccount, to: transfer.value.toAccount, amount: transfer.value.amount })
	}
}

// ─── 1. Intent Validation (The Judge) ───

describe('Intent Validation (Ярослав Мудрий)', () => {
	it('validates a correct AskIntent', () => {
		assert.equal(validateIntent({ type: 'ask', field: 'name', schema: { help: 'Name' } }), true)
	})

	it('rejects intent without type', () => {
		assert.throws(() => validateIntent({}), /Unknown intent type/)
	})

	it('rejects AskIntent without field', () => {
		assert.throws(() => validateIntent({ type: 'ask', schema: { help: 'X' } }), /non-empty "field"/)
	})

	it('rejects AskIntent without schema.help', () => {
		assert.throws(
			() => validateIntent({ type: 'ask', field: 'x', schema: {} }),
			/must have at least a "help"/,
		)
	})

	it('rejects progress without message', () => {
		assert.throws(() => validateIntent({ type: 'progress' }), /requires a "message"/)
	})

	it('rejects unknown intent type', () => {
		assert.throws(
			() => validateIntent({ type: 'dance', message: 'hi' }),
			/Unknown intent type: 'dance'/,
		)
	})
})

// ─── 2. Full Adapter Contract (Happy Path) ───

describe('Adapter Contract — Happy Path', () => {
	it('runs a complete model flow through a test adapter', async () => {
		const model = new ContractTestModel()
		const log = []

		const result = await runGenerator(model.run(), {
			ask: async (intent) => {
				log.push(`ask:${intent.field}`)
				return { value: 'Hello World' }
			},
			progress: (intent) => {
				log.push(`progress:${intent.message}`)
			},
			show: (intent) => {
				log.push(`show:${intent.level}:${intent.message}`)
			},
			result: (intent) => {
				log.push(`result:${JSON.stringify(intent.data)}`)
			},
		})

		assert.deepEqual(result, { echo: 'Hello World' })
		assert.deepEqual(log, [
			'ask:prompt',
			`progress:${ContractTestModel.messages.processing}`,
			`show:info:${ContractTestModel.messages.almostDone}`,
			'result:{"echo":"Hello World"}',
		])
	})

	it('skips ask if data is provided upfront', async () => {
		const model = new ContractTestModel({ prompt: 'Pre-filled' })
		const log = []

		const result = await runGenerator(model.run(), {
			ask: async () => {
				log.push('ask — SHOULD NOT BE CALLED')
				return { value: 'x' }
			},
			progress: (intent) => {
				log.push(`progress:${intent.message}`)
			},
			show: (intent) => {
				log.push(`show:${intent.level}`)
			},
		})

		assert.deepEqual(result, { echo: 'Pre-filled' })
		assert.ok(!log.includes('ask — SHOULD NOT BE CALLED'))
	})

	it('runs without timeout by default (web form scenario)', async () => {
		const model = new ContractTestModel()

		// Adapter takes 200ms to respond — no timeout by default
		const result = await runGenerator(model.run(), {
			ask: async () => {
				await new Promise((r) => setTimeout(r, 200))
				return { value: 'Patient answer' }
			},
		})

		assert.deepEqual(result, { echo: 'Patient answer' })
	})
})

// ─── 3. Contract Violations (The Judge punishes) ───

describe('Adapter Contract — Violations (Ярослав Мудрий)', () => {
	it('rejects adapter without ask handler', async () => {
		const model = new ContractTestModel()

		await assert.rejects(
			() => runGenerator(model.run(), /** @type {any} */ ({})),
			/MUST provide at least an "ask" handler/,
		)
	})

	it('rejects ask handler that returns wrong shape', async () => {
		const model = new ContractTestModel()

		await assert.rejects(
			() =>
				runGenerator(model.run(), {
					ask: async () => /** @type {any} */ ('just a string'),
				}),
			/must return \{ value/,
		)
	})

	it('rejects ask handler that returns value failing validation', async () => {
		const model = new ContractTestModel()

		await assert.rejects(
			() =>
				runGenerator(model.run(), {
					ask: async () => ({ value: '' }),
				}),
			/failed validation/,
		)
	})
})

// ─── 4. Timeout (Іван Сірко's Watch) — opt-in ───

describe('Timeout Protection (Іван Сірко)', () => {
	it('aborts if ask handler exceeds explicit timeout', async () => {
		const model = new ContractTestModel()

		await assert.rejects(
			() =>
				runGenerator(
					model.run(),
					{
						ask: () =>
							new Promise((resolve) => {
								let timer = setTimeout(() => resolve({ value: 'late' }), 500)
								timer.unref() // allow node to exit
							}),
					},
					{ timeoutMs: 50 },
				),
			/adapter did not respond within 50ms/,
		)
	})
})

// ─── 5. External Abort Signal (Іван Сірко) ───

describe('External Abort Signal (Іван Сірко)', () => {
	it('respects AbortController signal', async () => {
		const model = new ContractTestModel()
		const controller = new AbortController()

		controller.abort()

		await assert.rejects(
			() =>
				runGenerator(
					model.run(),
					{ ask: async () => ({ value: 'x' }) },
					{ signal: controller.signal },
				),
			/aborted/i,
		)
	})
})

// ─── 6. Model-as-Schema Form (OLMUI ask with Model) ───

describe('Model-as-Schema Form (Борис Патон)', () => {
	it('isModelSchema detects a class with static help fields', () => {
		assert.equal(isModelSchema(TransferModel), true)
		assert.equal(isModelSchema({ help: 'plain field' }), false)
		assert.equal(isModelSchema('string'), false)
		assert.equal(isModelSchema(null), false)
	})

	it('ask() sets model:true when given a Model class', () => {
		const intent = ask('transfer', TransferModel)
		assert.equal(intent.type, 'ask')
		assert.equal(intent.field, 'transfer')
		assert.equal(intent.model, true)
		assert.equal(intent.schema, TransferModel)
	})

	it('ask() does NOT set model flag for plain schema', () => {
		const intent = ask('name', { help: 'Your name', default: '' })
		assert.equal(intent.model, undefined)
	})

	it('validates Model-as-Schema ask intent without throwing', () => {
		const intent = ask('transfer', TransferModel)
		assert.equal(validateIntent(intent), true)
	})

	it('runs full TransferFlowModel — adapter returns raw data, generator receives Model instance', async () => {
		const model = new TransferFlowModel()
		const events = []

		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				events.push(`ask:${intent.field}:model=${intent.model}`)
				// Adapter collects raw data (plain object)
				return { value: { fromAccount: 'UA001', toAccount: 'UA999', amount: 500 } }
			},
			progress: (intent) => {
				events.push(`progress:${intent.message}`)
			},
		})

		// Runner instantiated TransferModel — generator got a typed instance
		assert.deepEqual(data, { txId: 'TX-001', from: 'UA001', to: 'UA999', amount: 500 })
		assert.deepEqual(events, [
			'ask:transfer:model=true',
			'progress:Processing transfer...',
		])
	})

	it('ask(Model) response.value is instanceof the Model class', async () => {
		let capturedInstance = null
		const gen = (async function* () {
			const response = yield ask('transfer', TransferModel)
			capturedInstance = response.value
			return result({})
		})()

		await runGenerator(gen, {
			ask: async () => ({ value: { fromAccount: 'UA001', toAccount: 'UA002', amount: 100 } }),
		})

		assert.ok(capturedInstance instanceof TransferModel, 'response.value must be instanceof TransferModel')
		assert.equal(capturedInstance.fromAccount, 'UA001')
		assert.equal(capturedInstance.amount, 100)
	})
})
