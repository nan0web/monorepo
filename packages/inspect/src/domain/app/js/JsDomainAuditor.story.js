import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { JsDomainAuditor } from './JsDomainAuditor.js'
import { DomainAuditor } from '../DomainAuditor.js'

/**
 * @param {AsyncGenerator<any, any, any>} gen
 */
async function drainGenerator(gen) {
	const intents = []
	let last = null
	while (true) {
		const step = await gen.next()
		if (step.done) {
			last = step.value
			break
		}
		intents.push(step.value)
	}
	return { intents, result: last }
}

describe('JsDomainAuditor Story — missing_model_options_jsdoc', () => {
	it('warns by default when Model constructor lacks Partial<ModelOptions> JSDoc', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/MyModel.js',
					`import { Model } from '@nan0web/types'
export class MyModel extends Model {
	static title = { help: 'Title', default: '' }
	/**
	 * @param {Record<string, any>} [data]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.title
	}
}
`,
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { intents, result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true, 'Default warn level must not fail audit')
		const warnIntent = intents.find((intent) => {
			const str = JSON.stringify(intent)
			return str.includes(DomainAuditor.UI.missing_model_options_jsdoc.split('{')[0])
		})
		assert.ok(
			warnIntent,
			`Expected warn intent for missing_model_options_jsdoc. Got: ${JSON.stringify(intents)}`
		)
	})

	it('passes cleanly when Model / ModelAsApp constructor has Partial<ModelOptions> or ModelAsAppOptions', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/ValidModel.js',
					`import { Model } from '@nan0web/types'
export class ValidModel extends Model {
	static title = { help: 'Title', default: '' }
	/**
	 * @param {Partial<ValidModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.title
	}
}
`,
				],
				[
					'src/domain/ValidApp.js',
					`import { ModelAsApp } from '@nan0web/ui-cli'
export class ValidApp extends ModelAsApp {
	/**
	 * @param {Partial<ValidApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}
}
`,
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor({ dir: '.' }, { db, t: (key) => key })
		const { intents, result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, true)
		const hasMissingWarn = intents.some((intent) =>
			JSON.stringify(intent).includes(DomainAuditor.UI.missing_model_options_jsdoc.split('{')[0])
		)
		assert.equal(hasMissingWarn, false, 'Valid JSDoc must not trigger missing_model_options_jsdoc')
	})

	it('fails with error when rules.missing_model_options_jsdoc is configured as "error"', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/StrictModel.js',
					`import { Model } from '@nan0web/types'
export class StrictModel extends Model {
	constructor(data = {}, options = {}) {
		super(data, options)
	}
}
`,
				],
			],
		})
		await db.connect()

		const auditor = new JsDomainAuditor(
			{ dir: '.' },
			{ db, t: (key) => key, config: { rules: { missing_model_options_jsdoc: 'error' } } }
		)
		const { result } = await drainGenerator(auditor.run())

		assert.equal(result.data.success, false)
		assert.ok(result.data.errors.some((e) => e.check === 'missing_model_options_jsdoc'))
	})
})
