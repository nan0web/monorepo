import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PipelineModel } from './PipelineModel.js'

describe('PipelineModel', () => {
	describe('Model-as-Schema (Static Fields)', () => {
		it('has static intent with positional: true', () => {
			assert.equal(typeof PipelineModel.intent.help, 'string')
			assert.equal(PipelineModel.intent.positional, true)
		})

		it('has static dir with positional: true', () => {
			assert.equal(typeof PipelineModel.dir.help, 'string')
			assert.equal(PipelineModel.dir.positional, true)
			assert.equal(PipelineModel.dir.default, '.')
		})

		it('has static appName field', () => {
			assert.equal(typeof PipelineModel.appName.help, 'string')
			assert.equal(PipelineModel.appName.default, '')
		})

		it('has static quiet with boolean type', () => {
			assert.equal(PipelineModel.quiet.default, false)
			assert.equal(PipelineModel.quiet.type, 'boolean')
		})

		it('has static from with default seed', () => {
			assert.equal(PipelineModel.from.default, 'seed')
		})
	})

	describe('Constructor & Defaults', () => {
		it('creates with all defaults', () => {
			const m = new PipelineModel()
			assert.equal(m.intent, '')
			assert.equal(m.dir, '.')
			assert.equal(m.quiet, false)
			assert.equal(m.from, 'seed')
		})

		it('overrides specified fields', () => {
			const m = new PipelineModel({ intent: 'Hostel booking', dir: 'apps/hostel' })
			assert.equal(m.intent, 'Hostel booking')
			assert.equal(m.dir, 'apps/hostel')
			assert.equal(m.quiet, false)
		})
	})

	describe('inferName', () => {
		it('extracts last significant word from intent', () => {
			const m = new PipelineModel({ intent: 'Booking app for Free Hostels' })
			assert.equal(m.inferName(), 'Hostels')
		})

		it('returns explicit name if provided', () => {
			const m = new PipelineModel({ intent: 'something', appName: 'Custom' })
			assert.equal(m.inferName(), 'Custom')
		})

		it('returns App for empty intent', () => {
			const m = new PipelineModel({ intent: '' })
			assert.equal(m.inferName(), 'App')
		})
	})

	describe('OLMUI Generator Contract', () => {
		it('has an async generator run() method', () => {
			const m = new PipelineModel()
			assert.equal(typeof m.run, 'function')
		})

		it('yields error when no intent provided', async () => {
			const m = new PipelineModel({ intent: '' })
			const iter = m.run()
			const first = await iter.next()
			const val1 = /** @type {any} */ (first.value)
			assert.strictEqual(val1.type, 'show')
			assert.strictEqual(val1.level, 'error')
			assert.match(val1.message, /Missing intent/i)

			const done = await iter.next()
			const val2 = /** @type {any} */ (done.value)
			assert.strictEqual(val2.data?.status || val2.status, 'failed')
		})
	})
})
