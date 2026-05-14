import { CatalogWatcherModel } from './domain/CatalogWatcherModel.js'

/**
 * @file sw.js — Service Worker adapter for catalog synchronization.
 *
 * Registers catalog index URLs for periodic validation inside a Service Worker.
 * Uses the Cache API + ETag/hash comparison to keep catalogs fresh.
 *
 * Zero hardcoded text — all messages from CatalogWatcherModel.UI.
 *
 * @example
 * // Inside your service-worker.js:
 * import { registerCatalogSync } from '@nan0web/catalog-watch/sw'
 *
 * registerCatalogSync(self, [
 *   'https://bank.example.com/@catalog/uk/cards.index.txt',
 *   'https://bank.example.com/@catalog/uk/branches.index.txt',
 * ])
 */

const CACHE_NAME = 'catalog-watch-v1'

/**
 * Register catalog sync inside a Service Worker.
 *
 * @param {ServiceWorkerGlobalScope} sw - The `self` reference from your SW
 * @param {string[]} indexUrls - Array of .index.txt URLs to watch
 * @param {{ interval?: number }} [options={}]
 */
export function registerCatalogSync(sw, indexUrls, options = {}) {
	const watchers = indexUrls.map(url => new CatalogWatcherModel({
		url,
		interval: options.interval ?? 3600,
		autoConfirm: true,
	}))

	// ─── Install: Pre-cache initial catalog indexes ───
	sw.addEventListener('install', (event) => {
		event.waitUntil(
			caches.open(CACHE_NAME).then(async (cache) => {
				for (const url of indexUrls) {
					try {
						const response = await fetch(url)
						if (response.ok) {
							await cache.put(url, response)
						}
					} catch {
						// Ignore network errors during install
					}
				}
			})
		)
	})

	// ─── Fetch: Intercept requests to catalog indexes ───
	sw.addEventListener('fetch', (event) => {
		const { request } = event
		const watcher = watchers.find(w => request.url.includes(w.url))

		if (!watcher) return // Not a catalog request

		event.respondWith(handleCatalogFetch(request, watcher))
	})

	// ─── Message: Handle visibilitychange from client ───
	sw.addEventListener('message', (event) => {
		if (event.data?.type === 'catalog:check') {
			// Client returned to foreground — check all catalogs
			Promise.all(watchers.map(w => checkSingleCatalog(w)))
				.then(results => {
					const updated = results.filter(r => r.updated)
					if (updated.length > 0 && event.source) {
						event.source.postMessage({
							type: 'catalog:updated',
							catalogs: updated,
						})
					}
				})
		}
	})
}

/**
 * Handle a fetch request for a catalog index with cache validation.
 *
 * @param {Request} request
 * @param {CatalogWatcherModel} watcher
 * @returns {Promise<Response>}
 */
async function handleCatalogFetch(request, watcher) {
	const cache = await caches.open(CACHE_NAME)
	const cachedResponse = await cache.match(request)

	try {
		// Run model check with real fetch
		const checkResult = await checkSingleCatalog(watcher)

		if (checkResult.updated && checkResult.index) {
			// Fetch fresh content and update cache
			const freshResponse = await fetch(request)
			if (freshResponse.ok) {
				await cache.put(request, freshResponse.clone())
				return freshResponse
			}
		}

		// No update — return cached response if available
		if (cachedResponse) return cachedResponse

		// No cache, no update — try network
		return await fetch(request)
	} catch {
		// Network error — return cached version if available
		if (cachedResponse) return cachedResponse
		return new Response(CatalogWatcherModel.UI.label_error, { status: 503 })
	}
}

/**
 * Run a single catalog check using its CatalogWatcherModel.
 *
 * @param {CatalogWatcherModel} watcher
 * @returns {Promise<{ updated: boolean, index?: object }>}
 */
async function checkSingleCatalog(watcher) {
	const env = { fetch: globalThis.fetch.bind(globalThis) }
	const gen = watcher.check(env)
	let step = await gen.next()

	while (!step.done) {
		if (step.value.type === 'ask') {
			step = await gen.next({ value: true }) // auto-confirm
		} else {
			step = await gen.next()
		}
	}

	return step.value?.data || { updated: false }
}

/**
 * Client-side helper: notify Service Worker to check catalogs.
 * Call this from your main application when user returns to the tab.
 *
 * @example
 * import { notifyCatalogCheck } from '@nan0web/catalog-watch/sw'
 *
 * document.addEventListener('visibilitychange', () => {
 *   if (!document.hidden) notifyCatalogCheck()
 * })
 */
export function notifyCatalogCheck() {
	if (!navigator.serviceWorker?.controller) return
	navigator.serviceWorker.controller.postMessage({ type: 'catalog:check' })
}
