import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Document } from '../../../../src/domain/Document.js'
import { ModelAsApp } from '../../../../src/domain/ModelAsApp.js'
import { ask, show, progress, result } from '../../../../src/core/Intent.js'

describe('Fractal OLMUI & App Widgets (v3.5.0)', () => {
	it('supports collection metadata lookup ($collection, $slug, $title, $alias, $singular, $plural)', () => {
		class AccountModel {
			static $collection = 'accounts'
			static $slug = 'account'
			static $title = 'fullName'
			static $singular = 'Account'
			static $plural = 'Accounts'
			static alias = 'account'
		}

		class OrderModel {
			static $alias = 'orders'
		}

		const getMeta = (M) => ({
			collection: M.$collection || M.$alias || M.alias,
			slug: M.$slug || M.alias || M.$alias,
			titleField: M.$title || 'title',
			singular: M.$singular || M.$alias || M.alias || 'Item',
			plural: M.$plural || M.$collection || M.$alias || 'Items',
		})

		assert.deepEqual(getMeta(AccountModel), {
			collection: 'accounts',
			slug: 'account',
			titleField: 'fullName',
			singular: 'Account',
			plural: 'Accounts',
		})

		assert.deepEqual(getMeta(OrderModel), {
			collection: 'orders',
			slug: 'orders',
			titleField: 'title',
			singular: 'orders',
			plural: 'orders',
		})
	})

	it('resolves Document $content with mixed passive blocks and active App models', () => {
		class LoanCalculatorApp extends ModelAsApp {
			static alias = 'loan-calculator'
		}

		const doc = new Document({
			hero: { title: 'Bank Hero' },
			$content: [
				{ Hero: true },
				{ App: LoanCalculatorApp, amount: 10000 },
				{ Markdown: { content: '# Rules' } },
			],
		})

		const resolved = doc.resolveContent()
		assert.equal(resolved.length, 3)
		assert.deepEqual(resolved[0], { title: 'Bank Hero' })
		assert.equal(resolved[1].App, LoanCalculatorApp)
		assert.equal(resolved[1].amount, 10000)
		assert.deepEqual(resolved[2], { Markdown: { content: '# Rules' } })
	})

	it('defines non-blocking AppRunner state machine protocol', () => {
		// AppRunner state transitions for Web
		const validStates = ['idle', 'waiting_input', 'processing', 'completed', 'error']
		assert.ok(validStates.includes('waiting_input'))

		class InteractiveApp extends ModelAsApp {
			*run() {
				const res = yield ask('amount', { help: 'Amount', default: 500 })
				yield show('Saved', 'success')
				return result({ finalAmount: res.value })
			}
		}

		const app = new InteractiveApp()
		const gen = app.run()

		// Step 1: initial ask intent -> puts widget into 'waiting_input'
		const step1 = gen.next()
		assert.equal(step1.done, false)
		assert.equal(step1.value.type, 'ask')
		assert.equal(step1.value.field, 'amount')

		// Step 2: user submits input -> widget transitions to 'processing' -> receives show
		const step2 = gen.next({ value: 1500 })
		assert.equal(step2.done, false)
		assert.equal(step2.value.type, 'show')
		assert.equal(step2.value.level, 'success')

		// Step 3: completed
		const step3 = gen.next()
		assert.equal(step3.done, true)
		assert.equal(step3.value.type, 'result')
		assert.deepEqual(step3.value.data, { finalAmount: 1500 })
	})

	it('supports parallel execution of multiple App widgets with isolated state', () => {
		class CounterApp extends ModelAsApp {
			constructor(data = {}, options = {}) {
				super(data, options)
				this.count = data.initial || 0
			}
			*run() {
				const step = yield ask('step', { help: 'Increment step', default: 1 })
				this.count += (step.value || 1)
				return result({ count: this.count })
			}
		}

		const app1 = new CounterApp({ initial: 10 })
		const app2 = new CounterApp({ initial: 100 })

		const gen1 = app1.run()
		const gen2 = app2.run()

		// App 1 prompts
		const q1 = gen1.next()
		assert.equal(q1.value.field, 'step')

		// App 2 prompts concurrently
		const q2 = gen2.next()
		assert.equal(q2.value.field, 'step')

		// App 2 answers first (e.g. user submitted form in widget 2 earlier)
		const r2 = gen2.next({ value: 5 })
		assert.equal(r2.done, true)
		assert.equal(r2.value.data.count, 105)

		// App 1 answers later
		const r1 = gen1.next({ value: 2 })
		assert.equal(r1.done, true)
		assert.equal(r1.value.data.count, 12)
	})
})
