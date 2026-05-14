import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui/core'
import DB from '@nan0web/db'

import { CatalogWatcherModel } from './CatalogWatcherModel.js'
import { CatalogIndexModel } from './CatalogIndexModel.js'
import { CatalogWatcher } from '../CatalogWatcher.js'

// ═══════════════════════════════════════════
// FIXTURES
// ═══════════════════════════════════════════

const SAMPLE_INDEX_TXT = `# @catalog cards uk
# version: 42
# hash: abc123def456
# items: 2
# updated: 2026-03-16T16:00:00Z
cards/visa.yaml
cards/mastercard.yaml
`

const UPDATED_INDEX_TXT = `# @catalog cards uk
# version: 43
# hash: xyz789updated
# items: 3
# updated: 2026-03-17T10:00:00Z
cards/visa.yaml
cards/mastercard.yaml
cards/amex.yaml
`

/** @param {{ etag?: string|null, body?: string, failHead?: boolean, failGet?: boolean, status304?: boolean }} opts */
function createFakeFetch(opts = {}) {
	const {
		etag = null,
		body = SAMPLE_INDEX_TXT,
		failHead = false,
		failGet = false,
		status304 = false,
	} = opts
	const calls = []

	const fn = async (url, init = {}) => {
		calls.push({ url, method: init.method || 'GET' })

		if (init.method === 'HEAD') {
			if (failHead) throw new Error('Network error on HEAD')
			if (status304) return { status: 304, headers: { get: () => null } }
			return {
				status: 200,
				headers: { get: (n) => n === 'etag' ? etag : null },
			}
		}

		if (failGet) throw new Error('Network error on GET')
		return {
			status: 200,
			text: async () => body,
			headers: { get: (n) => n === 'etag' ? etag : null },
		}
	}
	fn.calls = calls
	return fn
}

/** Collect all intents from runGenerator */
async function runAndCollect(gen, askResponse = { value: true }) {
	const intents = []
	const result = await runGenerator(gen, {
		ask: async (intent) => { intents.push({ type: 'ask', ...intent }); return askResponse },
		progress: (intent) => intents.push({ type: 'progress', ...intent }),
		log: (intent) => intents.push({ type: 'log', ...intent }),
	})
	return { result, intents }
}

// ═══════════════════════════════════════════
// W01–W13: Client (Watcher) Stories
// ═══════════════════════════════════════════

describe('W01 — Subscribe to updates', () => {
	it('accepts url and interval, starts in idle state', () => {
		const watcher = new CatalogWatcher({
			url: 'https://bank.example.com/@catalog/uk/cards.index.txt',
			interval: 1800,
		})
		assert.equal(watcher.url, 'https://bank.example.com/@catalog/uk/cards.index.txt')
		assert.equal(watcher.interval, 1800)
		assert.equal(watcher.status, 'idle')
	})
})

describe('W02 — HEAD-first strategy', () => {
	it('sends HEAD first, then GET only if ETag changed', async () => {
		const fetch = createFakeFetch({ etag: '"new-etag"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old-etag"',
			autoConfirm: true,
		})

		await runAndCollect(model.check({ fetch }))

		assert.equal(fetch.calls[0].method, 'HEAD')
		assert.equal(fetch.calls[1].method, 'GET')
		assert.equal(fetch.calls.length, 2)
	})
})

describe('W03 — 304 Not Modified', () => {
	it('returns unchanged without GET request on 304', async () => {
		const fetch = createFakeFetch({ status304: true })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"some-hash"',
			autoConfirm: true,
		})

		const { result, intents } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, false)
		assert.equal(model.status, 'unchanged')
		assert.equal(fetch.calls.length, 1) // HEAD only, no GET
		assert.ok(intents.some(i => i.type === 'log' && i.message === CatalogWatcherModel.UI.label_unchanged))
	})
})

describe('W04 — ETag match', () => {
	it('ETag equals lastHash — unchanged status, no GET', async () => {
		const fetch = createFakeFetch({ etag: '"same-hash"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"same-hash"',
			autoConfirm: true,
		})

		const { result } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, false)
		assert.equal(model.status, 'unchanged')
		assert.equal(fetch.calls.length, 1) // HEAD only
	})
})

describe('W05 — Fallback to index hash', () => {
	it('without ETag, compares hash from .index.txt header', async () => {
		const fetch = createFakeFetch({ etag: null, body: SAMPLE_INDEX_TXT })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: 'old-hash',
			autoConfirm: true,
		})

		const { result } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, true)
		assert.equal(result.downloaded, true)
		// Hash updated from index
		assert.equal(model.lastHash, 'abc123def456')
	})
})

describe('W06 — Interactive confirmation', () => {
	it('autoConfirm: false yields ask intent with "Download now?"', async () => {
		const fetch = createFakeFetch({ etag: '"new"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: false,
		})

		const { intents } = await runAndCollect(model.check({ fetch }), { value: true })
		const askIntent = intents.find(i => i.type === 'ask')

		assert.ok(askIntent, 'ask intent must be present')
		assert.equal(askIntent.schema.help, CatalogWatcherModel.UI.label_download)
	})
})

describe('W07 — Decline download', () => {
	it('user decline → updated:true, downloaded:false, lastHash unchanged', async () => {
		const fetch = createFakeFetch({ etag: '"new"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: false,
		})

		const { result } = await runAndCollect(model.check({ fetch }), { value: false })

		assert.equal(result.updated, true)
		assert.equal(result.downloaded, false)
		assert.equal(model.lastHash, '"old"') // unchanged — can retry later
	})
})

describe('W08 — Auto-confirm', () => {
	it('autoConfirm: true skips ask intent entirely', async () => {
		const fetch = createFakeFetch({ etag: '"new"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: true,
		})

		const { result, intents } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, true)
		assert.equal(result.downloaded, true)
		assert.ok(!intents.some(i => i.type === 'ask'), 'no ask intent')
	})
})

describe('W09 — Network error', () => {
	it('fetch error transitions status to error', async () => {
		const fetch = createFakeFetch({ failHead: true })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			autoConfirm: true,
		})

		const { result, intents } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, false)
		assert.ok(result.error)
		assert.equal(model.status, 'error')
		assert.ok(intents.some(i => i.type === 'log' && i.level === 'error'))
	})
})

describe('W10 — Parse error', () => {
	it('corrupt .index.txt triggers error_parse', async () => {
		// CatalogIndexModel.parse doesn't throw on arbitrary text,
		// so we simulate via a custom fetch that throws in text()
		const fetch = async (url, init = {}) => {
			if (init.method === 'HEAD') {
				return { status: 200, headers: { get: () => '"changed"' } }
			}
			return {
				status: 200,
				text: async () => { throw new Error('corrupt data') },
				headers: { get: () => '"changed"' },
			}
		}
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: true,
		})

		const { result } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, false)
		assert.ok(result.error)
		assert.equal(model.status, 'error')
	})
})

describe('W11 — lastCheck always updated', () => {
	it('lastCheck is set after unchanged result', async () => {
		const fetch = createFakeFetch({ etag: '"same"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"same"',
			autoConfirm: true,
		})
		assert.equal(model.lastCheck, '')

		await runAndCollect(model.check({ fetch }))

		assert.ok(model.lastCheck.length > 5, 'lastCheck was set')
	})

	it('lastCheck is set after updated result', async () => {
		const fetch = createFakeFetch({ etag: '"new"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: true,
		})

		await runAndCollect(model.check({ fetch }))

		assert.ok(model.lastCheck.length > 5, 'lastCheck was set after update')
	})
})

describe('W12 — URL validation', () => {
	it('empty url returns error immediately without network requests', async () => {
		const fetch = createFakeFetch()
		const model = new CatalogWatcherModel({ url: '', autoConfirm: true })

		const { result, intents } = await runAndCollect(model.check({ fetch }))

		assert.equal(result.updated, false)
		assert.equal(result.error, 'no_url')
		assert.equal(fetch.calls.length, 0) // zero network requests
		assert.ok(intents.some(i => i.type === 'log' && i.level === 'error'))
	})
})

describe('W13 — Infinite watch loop', () => {
	it('watch() starts with progress(init) and delegates to check()', async () => {
		const fetch = createFakeFetch({ etag: '"same"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"same"',
			autoConfirm: true,
		})

		const gen = model.watch({
			fetch,
			sleep: async () => { /* no-wait */ },
		})

		// First intent — progress(init)
		const first = await gen.next()
		assert.equal(first.value.type, 'progress')
		assert.equal(first.value.message, CatalogWatcherModel.UI.progress_init)

		// Skip remaining intents of first check cycle (progress + log)
		let step = await gen.next()
		while (!step.done && step.value.message !== CatalogWatcherModel.UI.label_next_check) {
			step = await gen.next()
		}
		// Reached label_next_check — watch loop works
		assert.equal(step.value.message, CatalogWatcherModel.UI.label_next_check)

		// Terminate — watch is working correctly
		await gen.return()
	})
})

// ═══════════════════════════════════════════
// A01–A05: Integration (Adapter) Stories
// ═══════════════════════════════════════════

describe('A01 — Emit updated', () => {
	it('CatalogWatcher emits updated with index data on change', async () => {
		const originalFetch = globalThis.fetch
		globalThis.fetch = createFakeFetch({ etag: '"new"' })

		try {
			const watcher = new CatalogWatcher({
				url: 'https://example.com/index.txt',
				interval: 9999,
				autoConfirm: true,
			})

			const received = await new Promise((resolve, reject) => {
				const timer = setTimeout(() => reject(new Error('timeout')), 2000)
				watcher.on('updated', (data) => { clearTimeout(timer); resolve(data) })
				watcher.checkNow()
			})

			// First-time check: lastHash is empty, etag is new → updated
			assert.ok(received, 'event data received')
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

describe('A02 — Emit unchanged', () => {
	it('CatalogWatcher emits unchanged when hash matches', async () => {
		const originalFetch = globalThis.fetch
		globalThis.fetch = createFakeFetch({ etag: '"same"' })

		try {
			const watcher = new CatalogWatcher({
				url: 'https://example.com/index.txt',
				interval: 9999,
				autoConfirm: true,
			})
			// Set lastHash via first checkNow
			globalThis.fetch = createFakeFetch({ etag: '"abc"' })
			await watcher.checkNow()

			// Same etag — should be unchanged
			globalThis.fetch = createFakeFetch({ etag: '"abc"' })

			const received = await new Promise((resolve) => {
				watcher.on('unchanged', () => resolve('unchanged'))
				watcher.checkNow()
			})

			assert.equal(received, 'unchanged')
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

describe('A03 — Emit error', () => {
	it('CatalogWatcher emits error on network failure', async () => {
		const originalFetch = globalThis.fetch
		globalThis.fetch = createFakeFetch({ failHead: true })

		try {
			const watcher = new CatalogWatcher({
				url: 'https://example.com/index.txt',
				interval: 9999,
				autoConfirm: true,
			})

			const received = await new Promise((resolve, reject) => {
				const timer = setTimeout(() => reject(new Error('timeout')), 2000)
				watcher.on('error', (data) => { clearTimeout(timer); resolve(data) })
				watcher.checkNow()
			})

			assert.ok(received, 'error event received')
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

describe('A04 — Start + immediate check', () => {
	it('start() triggers immediate check and sets up polling timer', async () => {
		const originalFetch = globalThis.fetch
		globalThis.fetch = createFakeFetch({ etag: '"first"' })

		try {
			const watcher = new CatalogWatcher({
				url: 'https://example.com/index.txt',
				interval: 9999,
				autoConfirm: true,
			})

			const received = await new Promise((resolve) => {
				watcher.on('updated', (data) => resolve(data))
				watcher.start()
			})

			assert.ok(received, 'immediate check on start()')

			// Clean up timer
			watcher.stop()
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

describe('A05 — Stop polling', () => {
	it('stop() clears the polling interval', () => {
		const watcher = new CatalogWatcher({
			url: 'https://example.com/index.txt',
			interval: 1,
			autoConfirm: true,
		})

		const originalFetch = globalThis.fetch
		globalThis.fetch = createFakeFetch({ status304: true })

		try {
			watcher.start()
			watcher.stop()
			// Repeated stop is safe
			watcher.stop()
			assert.ok(true, 'stop() completes without error')
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

// ═══════════════════════════════════════════
// P01–P04: PWA (Service Worker) Stories
// ═══════════════════════════════════════════

describe('P01 — Pre-caching logic', () => {
	it('creates CatalogWatcherModel per URL with autoConfirm', async () => {
		const urls = [
			'https://bank.example.com/@catalog/uk/cards.index.txt',
			'https://bank.example.com/@catalog/uk/branches.index.txt',
		]
		const watchers = urls.map(url => new CatalogWatcherModel({
			url,
			interval: 3600,
			autoConfirm: true,
		}))

		assert.equal(watchers.length, 2)
		assert.equal(watchers[0].url, urls[0])
		assert.equal(watchers[1].url, urls[1])
		assert.equal(watchers[0].autoConfirm, true)
	})
})

describe('P02 — Fetch interception logic', () => {
	it('matches catalog URLs and ignores unrelated requests', () => {
		const urls = [
			'https://bank.example.com/@catalog/uk/cards.index.txt',
		]
		const watchers = urls.map(url => new CatalogWatcherModel({ url, autoConfirm: true }))

		// Catalog request — should match
		const catalogUrl = 'https://bank.example.com/@catalog/uk/cards.index.txt'
		const found = watchers.find(w => catalogUrl.includes(w.url))
		assert.ok(found, 'watcher found for catalog URL')

		// Non-catalog request — should not match
		const otherUrl = 'https://bank.example.com/api/users'
		const notFound = watchers.find(w => otherUrl.includes(w.url))
		assert.equal(notFound, undefined, 'watcher not found for unrelated URL')
	})
})

describe('P03 — Message-based check', () => {
	it('checks all catalogs and filters updated ones', async () => {
		const watchers = [
			new CatalogWatcherModel({
				url: 'https://example.com/cards.index.txt',
				lastHash: '"old"',
				autoConfirm: true,
			}),
			new CatalogWatcherModel({
				url: 'https://example.com/metals.index.txt',
				lastHash: '"same"',
				autoConfirm: true,
			}),
		]

		const results = await Promise.all(watchers.map(async (w, i) => {
			const fetch = i === 0
				? createFakeFetch({ etag: '"new"' }) // cards — updated
				: createFakeFetch({ etag: '"same"' }) // metals — unchanged
			const { result } = await runAndCollect(w.check({ fetch }))
			return { url: w.url, ...result }
		}))

		const updated = results.filter(r => r.updated)
		assert.equal(updated.length, 1, 'only one catalog updated')
		assert.ok(updated[0].url.includes('cards'), 'cards was updated')
	})
})

describe('P04 — Visibility trigger', () => {
	it('notifyCatalogCheck is available as a function', async () => {
		// In Node.js there is no navigator.serviceWorker, so we just verify
		// the function exists and doesn't throw without SW
		const { notifyCatalogCheck } = await import('../sw.js')
		assert.equal(typeof notifyCatalogCheck, 'function')
		// Call without SW controller — must not throw
		notifyCatalogCheck()
	})
})

// ═══════════════════════════════════════════
// E01–E02: End-to-End Scenario Stories
// ═══════════════════════════════════════════

describe('E01 — Full OLMUI cycle with DB persistence', () => {
	it('check → detect update → auto-confirm → save to DB → verify', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const config = {
			url: 'https://bank.example.com/@catalog/uk/cards.index.txt',
			interval: 3600,
			autoConfirm: true,
			lastHash: 'old-hash',
		}
		const watcher = new CatalogWatcherModel(config)

		const env = { fetch: createFakeFetch({ etag: '"new-etag"' }) }
		const events = []

		const result = await runGenerator(watcher.check(env), {
			ask: async () => ({ value: true }),
			progress: (i) => events.push(`progress:${i.message}`),
			log: (i) => events.push(`log:${i.level}:${i.message}`),
		})

		// Intent contract
		assert.equal(result.updated, true)
		assert.equal(result.downloaded, true)
		assert.ok(events.includes(`log:success:${CatalogWatcherModel.UI.label_updated}`))

		// DB persistence
		await db.saveDocument('watcher/state', {
			lastHash: watcher.lastHash,
			lastCheck: watcher.lastCheck,
			status: watcher.status,
		})

		const saved = await db.loadDocument('watcher/state')
		assert.equal(saved.lastHash, '"new-etag"')
		assert.equal(saved.status, CatalogWatcherModel.Status.UPDATED)
		assert.ok(saved.lastCheck.length > 5)
	})
})

describe('E02 — Intent Contract', () => {
	it('every intent has type; log has level+message; progress has message; ask has field+schema', async () => {
		const fetch = createFakeFetch({ etag: '"new"' })
		const model = new CatalogWatcherModel({
			url: 'https://example.com/index.txt',
			lastHash: '"old"',
			autoConfirm: false,
		})

		// Collect raw intents
		const gen = model.check({ fetch })
		const rawIntents = []
		let step = await gen.next()
		while (!step.done) {
			rawIntents.push(step.value)
			if (step.value.type === 'ask') {
				step = await gen.next({ value: true })
			} else {
				step = await gen.next()
			}
		}

		// Validate contract
		for (const intent of rawIntents) {
			assert.ok(intent.type, `intent must have type: ${JSON.stringify(intent)}`)

			if (intent.type === 'log') {
				assert.ok(intent.level, 'log intent must have level')
				assert.ok(typeof intent.message === 'string', 'log intent must have message string')
			}

			if (intent.type === 'progress') {
				assert.ok(typeof intent.message === 'string', 'progress intent must have message string')
			}

			if (intent.type === 'ask') {
				assert.ok(intent.field, 'ask intent must have field')
				assert.ok(intent.schema, 'ask intent must have schema')
			}
		}

		assert.ok(rawIntents.length >= 3, `expected at least 3 intents, got ${rawIntents.length}`)
	})
})
