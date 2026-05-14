import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { CommentModel } from './CommentModel.js'

// ─── Test Helpers ───

/** Mock DB with in-memory storage */
function createMockDb() {
	const store = []
	return {
		store,
		save: async (item) => store.push(item),
		loadAll: async () => [...store],
		remove: async (ref) => {
			const idx = store.findIndex((c) => c.targetRef === ref)
			if (idx >= 0) store.splice(idx, 1)
		},
		clear: async () => { store.length = 0 },
	}
}

/** Mock viewport getter */
const mockViewport = () => ({ w: 1440, h: 900 })
const mobileViewport = () => ({ w: 375, h: 812 })

/** Create default test env */
function createEnv(overrides = {}) {
	return {
		db: createMockDb(),
		getViewport: mockViewport,
		...overrides,
	}
}

/**
 * Run generator yielding intents and responding with given fixture answers.
 * Returns { intents: Intent[], result: ResultIntent | undefined }.
 */
async function runScenario(model, env, responses = {}) {
	const gen = model.run(env)
	const intents = []
	let step = await gen.next()

	while (!step.done) {
		intents.push(step.value)

		const intent = step.value
		let response

		if (intent.type === 'ask') {
			const fixture = responses[intent.field]
			response = typeof fixture === 'function' ? fixture(intent) : fixture
		}

		step = await gen.next(response)
	}

	return { intents, result: step.value }
}

// ─── 1. Constructor & Defaults ───

describe('CommentModel — Constructor', () => {
	it('1. should create instance with default values', () => {
		const m = new CommentModel()
		assert.equal(m.targetRef, '')
		assert.equal(m.text, '')
		assert.equal(m.author, '')
		assert.equal(m.timestamp, '')
		assert.equal(m.viewport, null)
		assert.equal(m.mode, 'off')
	})

	it('2. should accept partial data in constructor', () => {
		const m = new CommentModel({ author: 'Yaro', text: 'Bug here' })
		assert.equal(m.author, 'Yaro')
		assert.equal(m.text, 'Bug here')
		assert.equal(m.targetRef, '')
	})

	it('3. should still apply known defaults when extra data is present', () => {
		const m = new CommentModel({ unknownField: 42, author: 'Test' })
		assert.equal(m.author, 'Test')
		assert.equal(m.text, '')
		assert.equal(m.mode, 'off')
	})
})

// ─── 2. Static Schema ───

describe('CommentModel — Schema (Model-as-Schema)', () => {
	it('4. should have all static field descriptors with help & default', () => {
		const fields = ['targetRef', 'text', 'author', 'timestamp', 'viewport', 'mode']
		for (const f of fields) {
			assert.ok(CommentModel[f], `Missing static field: ${f}`)
			assert.ok('help' in CommentModel[f], `Missing help in: ${f}`)
			assert.ok('default' in CommentModel[f], `Missing default in: ${f}`)
		}
	})

	it('5. should mark hidden fields as hidden', () => {
		assert.equal(CommentModel.targetRef.hidden, true)
		assert.equal(CommentModel.timestamp.hidden, true)
		assert.equal(CommentModel.viewport.hidden, true)
	})

	it('6. should have text field as positional', () => {
		assert.equal(CommentModel.text.positional, true)
	})

	it('7. should have mode options array', () => {
		assert.ok(Array.isArray(CommentModel.mode.options))
		assert.equal(CommentModel.mode.options.length, 4)
	})
})

// ─── 3. Validation ───

describe('CommentModel — Validation', () => {
	it('8. text.validate rejects empty string', () => {
		const res = CommentModel.text.validate('')
		assert.notEqual(res, true)
		assert.equal(res, 'error_text_required')
	})

	it('9. text.validate rejects whitespace-only', () => {
		const res = CommentModel.text.validate('   ')
		assert.notEqual(res, true)
	})

	it('10. text.validate accepts valid text', () => {
		assert.equal(CommentModel.text.validate('Hello'), true)
	})
})

// ─── 4. UI Dictionary (Zero Hardcode) ───

describe('CommentModel — UI Dictionary', () => {
	it('11. should define all required UI keys', () => {
		const requiredKeys = [
			'label_title', 'label_spotlight', 'label_saved',
			'label_dashboard', 'label_export', 'label_import',
			'error_text_required', 'error_no_target',
			'progress_init', 'progress_saving',
		]
		for (const key of requiredKeys) {
			assert.ok(CommentModel.UI[key], `Missing UI key: ${key}`)
			assert.equal(typeof CommentModel.UI[key], 'string')
		}
	})

	it('12. should define abort dictionary', () => {
		assert.ok(CommentModel.abort.user_cancelled)
		assert.ok(CommentModel.abort.escape_pressed)
	})
})

// ─── 5. Happy Path — Full Flow ───

describe('CommentModel — Happy Path', () => {
	it('13. should complete full flow: activate → select → text → author → save → close dashboard', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents, result: res } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#hero-section' },
			text: { value: 'Great design!' },
			author: { value: 'QA-Tester' },
			dashboard: { value: 'close' },
		})

		// Verify result
		assert.equal(res.type, 'result')
		assert.equal(res.data.status, 'ok')
		assert.equal(res.data.action, 'created')

		// Verify DB write
		assert.equal(env.db.store.length, 1)
		assert.equal(env.db.store[0].targetRef, '#hero-section')
		assert.equal(env.db.store[0].text, 'Great design!')
		// author is no longer prompted — stays default
		assert.equal(env.db.store[0].author, '')
	})

	it('14. should set viewport from env.getViewport()', async () => {
		const env = createEnv({ getViewport: mobileViewport })
		const model = new CommentModel()

		await runScenario(model, env, {
			mode: { value: 'url' },
			targetRef: { value: '.btn-primary' },
			text: { value: 'Button misaligned' },
			author: { value: '' },
			dashboard: { value: 'close' },
		})

		assert.deepEqual(env.db.store[0].viewport, { w: 375, h: 812 })
	})

	it('15. should set timestamp as ISO string', async () => {
		const env = createEnv()
		const model = new CommentModel()

		await runScenario(model, env, {
			mode: { value: 'hotkey' },
			targetRef: { value: 'div.card' },
			text: { value: 'Needs padding' },
			author: { value: 'Dev' },
			dashboard: { value: 'close' },
		})

		const ts = env.db.store[0].timestamp
		assert.ok(ts, 'timestamp should exist')
		assert.ok(!isNaN(Date.parse(ts)), 'timestamp should be valid ISO-8601')
	})

	it('16. should save with empty author (author derived from email:from)', async () => {
		const env = createEnv()
		const model = new CommentModel()

		await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#nav' },
			text: { value: 'Anonymous note' },
			dashboard: { value: 'close' },
		})

		assert.equal(env.db.store[0].author, '')
	})
})

// ─── 6. Intent Structure ───

describe('CommentModel — Intent Structure', () => {
	it('17. should yield progress as first intent (init)', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#x' },
			text: { value: 'ok' },
			author: { value: '' },
			dashboard: { value: 'close' },
		})

		assert.equal(intents[0].type, 'progress')
		assert.equal(intents[0].message, CommentModel.UI.progress_init)
	})

	it('18. should yield ask(mode) after init', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#x' },
			text: { value: 'ok' },
			author: { value: '' },
			dashboard: { value: 'close' },
		})

		const askMode = intents.find((i) => i.type === 'ask' && i.field === 'mode')
		assert.ok(askMode, 'Should have ask(mode)')
	})

	it('19. should yield progress(spotlight) after mode activation', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#x' },
			text: { value: 'ok' },
			author: { value: '' },
			dashboard: { value: 'close' },
		})

		const spotlight = intents.find((i) => i.type === 'progress' && i.message === CommentModel.UI.label_spotlight)
		assert.ok(spotlight, 'Should yield spotlight progress')
	})

	it('20. should yield log(success) after saving', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#x' },
			text: { value: 'ok' },
			author: { value: '' },
			dashboard: { value: 'close' },
		})

		const saved = intents.find((i) => i.type === 'log' && i.message === CommentModel.UI.label_saved)
		assert.ok(saved, 'Should yield label_saved log')
		assert.equal(saved.level, 'success')
	})
})

// ─── 7. Cancellation / Abort ───

describe('CommentModel — Cancellation', () => {
	it('21. should abort on mode activation cancel', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { result: res } = await runScenario(model, env, {
			mode: { cancelled: true },
		})

		assert.equal(res.data.status, 'cancelled')
		assert.equal(res.data.reason, 'activation')
		assert.equal(env.db.store.length, 0)
	})

	it('22. should abort on target selection cancel', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { result: res } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { cancelled: true },
		})

		assert.equal(res.data.status, 'cancelled')
		assert.equal(res.data.reason, 'target_selection')
	})

	it('23. should abort on text input cancel', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { result: res } = await runScenario(model, env, {
			mode: { value: 'url' },
			targetRef: { value: '#btn' },
			text: { cancelled: true },
		})

		assert.equal(res.data.status, 'cancelled')
		assert.equal(res.data.reason, 'text_input')
	})
})

// ─── 8. Error Cases ───

describe('CommentModel — Error Handling', () => {
	it('24. should error when targetRef is empty', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { intents, result: res } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '' },
		})

		assert.equal(res.data.status, 'error')
		assert.equal(res.data.reason, 'no_target')
		const errLog = intents.find((i) => i.type === 'log' && i.level === 'error')
		assert.ok(errLog)
	})

	it('25. should error when text fails validation', async () => {
		const env = createEnv()
		const model = new CommentModel()

		const { result: res } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#x' },
			text: { value: '' },
		})

		assert.equal(res.data.status, 'error')
		assert.equal(res.data.reason, 'validation_failed')
	})

	it('26. should error when db.save throws', async () => {
		const env = createEnv({
			db: {
				save: async () => { throw new Error('IndexedDB write failed') },
				loadAll: async () => [],
				clear: async () => {},
			},
		})
		const model = new CommentModel()

		const { result: res } = await runScenario(model, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#section' },
			text: { value: 'Test' },
			author: { value: '' },
		})

		assert.equal(res.data.status, 'error')
		assert.equal(res.data.reason, 'save_failed')
		assert.ok(res.data.message)
	})
})

// ─── 9. Export (sub-generator) ───

/**
 * Run a sub-generator collecting intents and providing ask responses.
 */
async function runSubGenerator(gen, responses = {}) {
	const intents = []
	let step = await gen.next()

	while (!step.done) {
		intents.push(step.value)
		const intent = step.value
		let response
		if (intent.type === 'ask') {
			const fixture = responses[intent.field]
			response = typeof fixture === 'function' ? fixture(intent) : fixture
		}
		step = await gen.next(response)
	}

	return { intents, result: step.value }
}

describe('CommentModel — Export', () => {
	it('27. should export all comments', async () => {
		const db = createMockDb()
		db.store.push(
			{ targetRef: '#a', text: 'First', author: 'X', timestamp: '2026-01-01', viewport: null },
			{ targetRef: '#b', text: 'Second', author: 'Y', timestamp: '2026-01-02', viewport: null },
		)
		const model = new CommentModel()

		const { result } = await runSubGenerator(model.exportComments({ db }))

		assert.equal(result.count, 2)
		assert.ok(Array.isArray(result.data))
	})

	it('28. should warn when exporting with no comments', async () => {
		const db = { loadAll: async () => [], save: async () => {}, clear: async () => {} }
		const model = new CommentModel()

		const { intents, result } = await runSubGenerator(model.exportComments({ db }))

		assert.equal(result.count, 0)
		const warn = intents.find((i) => i.type === 'log' && i.level === 'warn')
		assert.ok(warn, 'Should warn about empty export')
	})
})

// ─── 10. Import (sub-generator) ───

describe('CommentModel — Import', () => {
	it('29. should import valid JSON array', async () => {
		const db = createMockDb()
		const model = new CommentModel()

		const importData = [
			{ targetRef: '#a', text: 'Imported 1', author: 'QA', timestamp: '2026-01-01', viewport: null },
			{ targetRef: '#b', text: 'Imported 2', author: 'QA', timestamp: '2026-01-02', viewport: null },
		]

		const { result } = await runSubGenerator(model.importComments({ db }), {
			importFile: { value: importData },
		})

		assert.equal(result.count, 2)
		assert.equal(db.store.length, 2)
	})

	it('30. should reject non-array import', async () => {
		const db = createMockDb()
		const model = new CommentModel()

		const { result } = await runSubGenerator(model.importComments({ db }), {
			importFile: { value: 'not-an-array' },
		})

		assert.equal(result.count, 0)
		assert.equal(result.error, 'invalid_format')
	})

	it('31. should handle cancelled import', async () => {
		const db = createMockDb()
		const model = new CommentModel()

		const { result } = await runSubGenerator(model.importComments({ db }), {
			importFile: { cancelled: true },
		})

		assert.equal(result.count, 0)
	})
})

// ─── 11. Clear (sub-generator) ───

describe('CommentModel — Clear', () => {
	it('32. should clear all comments from storage', async () => {
		const db = createMockDb()
		db.store.push({ targetRef: '#a', text: 'old' })
		const model = new CommentModel()

		await runSubGenerator(model.clearComments({ db }))

		assert.equal(db.store.length, 0)
	})
})

// ─── 12. State Mutations ───

describe('CommentModel — State Mutations', () => {
	it('33. should mutate instance fields during flow', async () => {
		const env = createEnv()
		const model = new CommentModel()

		assert.equal(model.mode, 'off')
		assert.equal(model.targetRef, '')
		assert.equal(model.text, '')

		await runScenario(model, env, {
			mode: { value: 'hotkey' },
			targetRef: { value: '#footer' },
			text: { value: 'Check spacing' },
			author: { value: 'Designer' },
			dashboard: { value: 'close' },
		})

		assert.equal(model.mode, 'hotkey')
		assert.equal(model.targetRef, '#footer')
		assert.equal(model.text, 'Check spacing')
		// author is no longer interactively set
		assert.equal(model.author, '')
		assert.ok(model.timestamp)
		assert.deepEqual(model.viewport, { w: 1440, h: 900 })
	})
})

// ─── 13. Mode Constants ───

describe('CommentModel — Mode Constants', () => {
	it('34. should have all mode constants matching options', () => {
		const values = CommentModel.mode.options.map((o) => o.value)
		assert.ok(values.includes(CommentModel.Mode.OFF))
		assert.ok(values.includes(CommentModel.Mode.URL))
		assert.ok(values.includes(CommentModel.Mode.HOTKEY))
		assert.ok(values.includes(CommentModel.Mode.TOGGLE))
	})
})

// ─── 14. Multiple Sequential Comments ───

describe('CommentModel — Multiple Comments', () => {
	it('35. should accumulate multiple comments in db', async () => {
		const db = createMockDb()
		const env = { db, getViewport: mockViewport }

		// First comment
		const m1 = new CommentModel()
		await runScenario(m1, env, {
			mode: { value: 'toggle' },
			targetRef: { value: '#h1' },
			text: { value: 'Title too big' },
			author: { value: 'QA' },
			dashboard: { value: 'close' },
		})

		// Second comment
		const m2 = new CommentModel()
		await runScenario(m2, env, {
			mode: { value: 'url' },
			targetRef: { value: '.card' },
			text: { value: 'Card shadow missing' },
			author: { value: 'QA' },
			dashboard: { value: 'close' },
		})

		assert.equal(db.store.length, 2)
		assert.equal(db.store[0].targetRef, '#h1')
		assert.equal(db.store[1].targetRef, '.card')
	})
})
