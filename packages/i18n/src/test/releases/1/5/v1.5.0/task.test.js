import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import inspect from '../../../../../cli/inspect.js'

describe('Release v1.5.0: i18n Universal Inspector (MaSaA v2) - In-Memory', () => {
	// Utility helper to run inspect in-memory while capturing console.log
	async function runInspect(db, args = {}) {
		const logs = []
		const originalLog = console.log
		console.log = (...msg) => {
			logs.push(msg.join(' '))
		}

		let error = null
		try {
			await inspect({
				db,
				domain: 'src/domain',
				vocab: 'play/data/uk/_/t.nan0',
				ui: 'src/ui',
				throwOnError: true,
				...args,
			})
		} catch (err) {
			error = err
		} finally {
			console.log = originalLog
		}

		return {
			logs: logs.join('\n'),
			error,
		}
	}

	it('it should extract keys from domain models', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/TestModel.js',
					`
					export default class TestModel {
						static UI = 'test.label'
						static help = 'test.help'
					}
					`,
				],
				[
					'play/data/uk/_/t.nan0',
					`
					'test.label': 'Label',
					'test.help': 'Help'
					`,
				],
			],
		})
		await db.connect()

		const res = await runInspect(db)
		assert.equal(res.error, null)
		assert.ok(res.logs.includes('Found 2 keys in domain models'))
		assert.ok(res.logs.includes('All domain keys translated in vocabulary'))
	})

	it('it should detect missing translations', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/TestModel.js',
					`
					export default class TestModel {
						static UI = 'test.label'
						static help = 'test.help'
					}
					`,
				],
				[
					'play/data/uk/_/t.nan0',
					`
					'only.one': 'Key'
					`,
				],
			],
		})
		await db.connect()

		const res = await runInspect(db)
		assert.ok(res.error instanceof Error)
		assert.ok(res.logs.includes('Missing translations for keys'))
	})

	it('it should detect forbidden hardcoded t() calls in UI', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/TestModel.js',
					`
					export default class TestModel {
						static UI = 'test.label'
						static help = 'test.help'
					}
					`,
				],
				[
					'play/data/uk/_/t.nan0',
					`
					'test.label': 'Label',
					'test.help': 'Help'
					`,
				],
				[
					'src/ui/Component.js',
					`
					const label = t('Hardcoded Literal')
					`,
				],
			],
		})
		await db.connect()

		const res = await runInspect(db)
		assert.ok(res.error instanceof Error)
		assert.ok(res.logs.includes('Hardcoded Literal'))
	})

	it('it should allow only compliant t() calls (e.g. t(Model.UI.key))', async () => {
		const db = new DB({
			predefined: [
				[
					'src/domain/TestModel.js',
					`
					export default class TestModel {
						static UI = 'test.label'
						static help = 'test.help'
					}
					`,
				],
				[
					'play/data/uk/_/t.nan0',
					`
					'test.label': 'Label',
					'test.help': 'Help'
					`,
				],
				[
					'src/ui/Component.js',
					`
					const label = t(TestModel.UI)
					`,
				],
			],
		})
		await db.connect()

		const res = await runInspect(db)
		assert.equal(res.error, null)
		assert.ok(res.logs.includes('0 Hardcoded t() or forbidden t() usage found'))
	})
})
