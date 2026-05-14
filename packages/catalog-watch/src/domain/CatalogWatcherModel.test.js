import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { CatalogWatcherModel } from './CatalogWatcherModel.js'
import { CatalogIndexModel } from './CatalogIndexModel.js'

// ─── Test Helpers ───

const SAMPLE_INDEX_TXT = `# @catalog cards uk
# version: 42
# hash: abc123def
# items: 3
# updated: 2026-03-16T16:00:00Z
cards/visa-gold.yaml
cards/visa-classic.yaml
cards/mastercard-standard.yaml
`

const UPDATED_INDEX_TXT = `# @catalog cards uk
# version: 43
# hash: xyz789new
# items: 4
# updated: 2026-03-17T10:00:00Z
cards/visa-gold.yaml
cards/visa-classic.yaml
cards/mastercard-standard.yaml
cards/mastercard-platinum.yaml
`

/** Creates a fake fetch that returns HEAD + GET responses */
function createFakeFetch({ headStatus = 200, etag = null, getText = SAMPLE_INDEX_TXT, throwError = false } = {}) {
	return async (url, init = {}) => {
		if (throwError) throw new Error('Network failure')

		if (init.method === 'HEAD') {
			return {
				status: headStatus,
				headers: {
					get: (name) => name === 'etag' ? etag : null,
				},
			}
		}

		return {
			status: 200,
			text: async () => getText,
			headers: {
				get: (name) => name === 'etag' ? etag : null,
			},
		}
	}
}

/** Runs the check() generator step-by-step, auto-responding to ask intents */
async function runCheck(model, env, askResponses = {}) {
	const gen = model.check(env)
	const intents = []
	let step = await gen.next()
	while (!step.done) {
		intents.push(step.value)
		const response = step.value.type === 'ask'
			? (askResponses[step.value.field] ?? { value: true })
			: undefined
		step = await gen.next(response)
	}
	return { intents, result: step.value }
}

// ═══════════════════════════════════════════════
// CatalogWatcherModel — Schema & Defaults
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: Schema', () => {
	it('constructor applies all defaults', () => {
		const w = new CatalogWatcherModel()

		assert.equal(w.url, '')
		assert.equal(w.interval, 3600)
		assert.equal(w.lastHash, '')
		assert.equal(w.lastCheck, '')
		assert.equal(w.status, 'idle')
		assert.equal(w.autoConfirm, false)
		assert.equal(w.lastIndex, null)
	})

	it('constructor accepts partial overrides', () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/@catalog/uk/cards.index.txt',
			interval: 60,
			autoConfirm: true,
		})

		assert.equal(w.url, 'https://example.com/@catalog/uk/cards.index.txt')
		assert.equal(w.interval, 60)
		assert.equal(w.autoConfirm, true)
		assert.equal(w.status, 'idle') // default
	})

	it('static UI contains all required i18n keys', () => {
		const keys = Object.keys(CatalogWatcherModel.UI)

		assert.ok(keys.includes('label_watching'))
		assert.ok(keys.includes('label_updated'))
		assert.ok(keys.includes('label_unchanged'))
		assert.ok(keys.includes('label_checking'))
		assert.ok(keys.includes('error_no_url'))
		assert.ok(keys.includes('error_fetch'))
		assert.ok(keys.includes('error_parse'))
		assert.ok(keys.includes('progress_init'))
		assert.ok(keys.includes('progress_checking'))
		assert.ok(keys.includes('label_download'))
		assert.ok(keys.includes('label_downloaded'))
		assert.ok(keys.includes('label_skipped'))
	})

	it('static Status enum has all 5 states', () => {
		assert.equal(CatalogWatcherModel.Status.IDLE, 'idle')
		assert.equal(CatalogWatcherModel.Status.CHECKING, 'checking')
		assert.equal(CatalogWatcherModel.Status.UPDATED, 'updated')
		assert.equal(CatalogWatcherModel.Status.UNCHANGED, 'unchanged')
		assert.equal(CatalogWatcherModel.Status.ERROR, 'error')
	})

	it('static abort dictionary is defined for i18n', () => {
		assert.ok(CatalogWatcherModel.abort.user_cancelled)
		assert.ok(CatalogWatcherModel.abort.timeout)
	})

	it('all static schema fields have help and default', () => {
		const schemaFields = ['url', 'interval', 'lastHash', 'lastCheck', 'status', 'autoConfirm']
		for (const field of schemaFields) {
			assert.ok(CatalogWatcherModel[field].help, `${field} missing help`)
			assert.ok('default' in CatalogWatcherModel[field], `${field} missing default`)
		}
	})

	it('hidden fields are marked correctly', () => {
		assert.equal(CatalogWatcherModel.lastHash.hidden, true)
		assert.equal(CatalogWatcherModel.lastCheck.hidden, true)
	})
})

// ═══════════════════════════════════════════════
// CatalogWatcherModel: check() — Happy Paths
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: check() — Happy Paths', () => {
	it('first check detects update and downloads with user confirmation', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/@catalog/uk/cards.index.txt',
		})

		const env = { fetch: createFakeFetch() }
		const { intents, result: final } = await runCheck(w, env)

		// Should have: progress(checking) → log(updated!) → ask(download) → log(downloaded)
		assert.ok(intents.some(i => i.type === 'progress'))
		assert.ok(intents.some(i => i.type === 'log' && i.message === CatalogWatcherModel.UI.label_updated))
		assert.ok(intents.some(i => i.type === 'ask' && i.field === 'download'))
		assert.ok(intents.some(i => i.type === 'log' && i.message === CatalogWatcherModel.UI.label_downloaded))

		assert.equal(final.data.updated, true)
		assert.equal(final.data.downloaded, true)
		assert.equal(final.data.index.catalog, 'cards')
		assert.equal(final.data.index.locale, 'uk')
		assert.equal(final.data.index.version, 42)
		assert.equal(final.data.index.itemCount, 3)
		assert.deepEqual(final.data.index.files, [
			'cards/visa-gold.yaml',
			'cards/visa-classic.yaml',
			'cards/mastercard-standard.yaml',
		])
	})

	it('autoConfirm: true skips ask intent and downloads directly', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/@catalog/uk/cards.index.txt',
			autoConfirm: true,
		})

		const env = { fetch: createFakeFetch() }
		const { intents, result: final } = await runCheck(w, env)

		// Should NOT have ask intent
		assert.ok(!intents.some(i => i.type === 'ask'))
		assert.equal(final.data.updated, true)
		assert.equal(final.data.downloaded, true)
	})

	it('state mutation: updates lastHash, lastCheck, lastIndex, status', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/@catalog/uk/cards.index.txt',
			autoConfirm: true,
		})

		assert.equal(w.lastHash, '') // Before
		assert.equal(w.lastIndex, null)

		const env = { fetch: createFakeFetch() }
		await runCheck(w, env)

		assert.equal(w.lastHash, 'abc123def') // hash from index header
		assert.ok(w.lastCheck.length > 0)
		assert.ok(w.lastIndex instanceof CatalogIndexModel)
		assert.equal(w.status, 'updated')
	})

	it('second check with same hash returns unchanged', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/@catalog/uk/cards.index.txt',
			autoConfirm: true,
			lastHash: 'abc123def', // Already have this hash
		})

		const env = { fetch: createFakeFetch() }
		const { intents, result: final } = await runCheck(w, env)

		assert.ok(intents.some(i => i.message === CatalogWatcherModel.UI.label_unchanged))
		assert.equal(final.data.updated, false)
		assert.equal(w.status, 'unchanged')
	})

	it('ETag match in HEAD response returns unchanged without GET', async () => {
		let getCalled = false
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"etag-v1"',
		})

		const env = {
			fetch: async (url, init = {}) => {
				if (init.method === 'HEAD') {
					return {
						status: 200,
						headers: { get: (n) => n === 'etag' ? '"etag-v1"' : null },
					}
				}
				getCalled = true
				return { status: 200, text: async () => SAMPLE_INDEX_TXT }
			},
		}

		const { result: final } = await runCheck(w, env)

		assert.equal(final.data.updated, false)
		assert.equal(getCalled, false) // GET was never called
	})

	it('304 status from HEAD returns unchanged immediately', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
		})

		const env = { fetch: createFakeFetch({ headStatus: 304 }) }
		const { result: final } = await runCheck(w, env)

		assert.equal(final.data.updated, false)
		assert.equal(w.status, 'unchanged')
	})

	it('new ETag + different hash from index triggers update', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
			lastHash: 'old-hash',
		})

		const env = { fetch: createFakeFetch({ etag: '"new-etag"' }) }
		const { result: final } = await runCheck(w, env)

		assert.equal(final.data.updated, true)
		assert.equal(final.data.downloaded, true)
		assert.equal(w.lastHash, '"new-etag"') // ETag takes priority
	})

	it('no ETag available — falls back to hash from .index.txt header', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
			lastHash: 'old-hash',
		})

		const env = { fetch: createFakeFetch({ etag: null }) }
		const { result: final } = await runCheck(w, env)

		assert.equal(final.data.updated, true)
		assert.equal(w.lastHash, 'abc123def') // from index header
	})
})

// ═══════════════════════════════════════════════
// CatalogWatcherModel: check() — User Rejection
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: check() — User Rejection', () => {
	it('user declines download: returns updated=true, downloaded=false', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
		})

		const env = { fetch: createFakeFetch() }
		const { intents, result: final } = await runCheck(w, env, {
			download: { value: false },
		})

		assert.ok(intents.some(i => i.message === CatalogWatcherModel.UI.label_skipped))
		assert.equal(final.data.updated, true)
		assert.equal(final.data.downloaded, false)
	})

	it('user declines: lastHash is NOT updated (can retry later)', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: 'old',
		})

		const env = { fetch: createFakeFetch() }
		await runCheck(w, env, { download: { value: false } })

		assert.equal(w.lastHash, 'old') // NOT changed
		assert.ok(w.lastCheck.length > 0) // timestamp IS updated
	})
})

// ═══════════════════════════════════════════════
// CatalogWatcherModel: check() — Error Handling
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: check() — Error Handling', () => {
	it('missing URL yields error and returns failure', async () => {
		const w = new CatalogWatcherModel() // no url
		const env = { fetch: createFakeFetch() }
		const { intents, result: final } = await runCheck(w, env)

		assert.equal(intents[0].type, 'log')
		assert.equal(intents[0].level, 'error')
		assert.equal(intents[0].message, CatalogWatcherModel.UI.error_no_url)

		assert.equal(final.data.updated, false)
		assert.equal(final.data.error, 'no_url')
	})

	it('network error yields error status and log', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://unreachable.example.com/index.txt',
		})

		const env = { fetch: createFakeFetch({ throwError: true }) }
		const { intents, result: final } = await runCheck(w, env)

		assert.ok(intents.some(i => i.type === 'log' && i.level === 'error'))
		assert.equal(w.status, 'error')
		assert.equal(final.data.updated, false)
		assert.equal(final.data.error, 'Network failure')
	})

	it('status transitions to ERROR on fetch failure', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
		})

		assert.equal(w.status, 'idle') // Before

		const env = { fetch: createFakeFetch({ throwError: true }) }
		await runCheck(w, env)

		assert.equal(w.status, 'error') // After
	})
})

// ═══════════════════════════════════════════════
// CatalogWatcherModel: watch() — Loop Control
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: watch() — Loop', () => {
	it('watch() without url returns immediately with 0 cycles', async () => {
		const w = new CatalogWatcherModel()
		const gen = w.watch({ fetch: createFakeFetch(), sleep: async () => {} })

		const step1 = await gen.next() // log(error)
		assert.equal(step1.value.type, 'log')
		assert.equal(step1.value.level, 'error')

		const step2 = await gen.next()
		assert.equal(step2.done, true)
		assert.equal(step2.value.data.cycles, 0)
	})

	it('watch() emits progress(init) as first intent', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
		})

		let sleepCalled = false
		const env = {
			fetch: createFakeFetch(),
			sleep: async () => { sleepCalled = true },
		}

		const gen = w.watch(env)
		const step1 = await gen.next()

		assert.equal(step1.value.type, 'progress')
		assert.equal(step1.value.message, CatalogWatcherModel.UI.progress_init)

		// Advance through the first check cycle's intents, then break
		let step = await gen.next()
		let safety = 0
		while (!step.done && safety < 20) {
			if (step.value.message === CatalogWatcherModel.UI.label_next_check) {
				break // We reached the sleep phase — first cycle complete
			}
			step = await gen.next(
				step.value.type === 'ask' ? { value: true } : undefined
			)
			safety++
		}

		assert.ok(sleepCalled || safety < 20) // sleep was invoked or we broke
	})
})

// ═══════════════════════════════════════════════
// CatalogWatcherModel: Intent Sequence Contracts
// ═══════════════════════════════════════════════

describe('CatalogWatcherModel: Intent Contract', () => {
	it('all yielded intents have valid type field', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
		})

		const env = { fetch: createFakeFetch() }
		const { intents } = await runCheck(w, env)

		for (const intent of intents) {
			assert.ok(
				['ask', 'progress', 'log'].includes(intent.type),
				`Invalid intent type: ${intent.type}`
			)
		}
	})

	it('ask intent for download has correct schema', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: false,
		})

		const env = { fetch: createFakeFetch() }
		const { intents } = await runCheck(w, env)

		const askIntent = intents.find(i => i.type === 'ask')
		assert.ok(askIntent)
		assert.equal(askIntent.field, 'download')
		assert.equal(askIntent.schema.type, 'boolean')
		assert.equal(askIntent.schema.default, true)
		assert.ok(askIntent.schema.help)
	})

	it('log intents always have level and message', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
		})

		const env = { fetch: createFakeFetch() }
		const { intents } = await runCheck(w, env)

		const logs = intents.filter(i => i.type === 'log')
		for (const l of logs) {
			assert.ok(typeof l.level === 'string', 'log missing level')
			assert.ok(typeof l.message === 'string', 'log missing message')
		}
	})

	it('progress intents always have message string', async () => {
		const w = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
		})

		const env = { fetch: createFakeFetch() }
		const { intents } = await runCheck(w, env)

		const progs = intents.filter(i => i.type === 'progress')
		for (const p of progs) {
			assert.ok(typeof p.message === 'string', 'progress missing message')
		}
	})
})
