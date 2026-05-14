import { Model } from '@nan0web/core'
import { ask, progress, log, result } from '@nan0web/ui/core'
import { CatalogIndexModel } from './CatalogIndexModel.js'

/**
 * @file CatalogWatcherModel — Client-side catalog subscription watcher.
 *
 * Periodically checks a remote `.index.txt` for changes via HTTP HEAD/GET.
 * Emits intents when catalog is updated, unchanged, or on error.
 * Works in CLI, Browser, PWA Service Worker, AI Agent — any OLMUI adapter.
 *
 * Default poll interval: 3600 seconds (1 hour).
 */
export class CatalogWatcherModel extends Model {
	// ==========================================
	// 1. MODEL AS SCHEMA (Static Definition)
	// ==========================================

	static url = {
		help: 'URL of the catalog index to watch',
		default: '',
		type: 'string',
		hint: 'url',
		positional: true,
	}

	static interval = {
		help: 'Polling interval in seconds',
		default: 3600,
		type: 'number',
		hint: 'slider',
	}

	static lastHash = {
		help: 'Last known hash from previous check',
		default: '',
		type: 'string',
		hidden: true,
	}

	static lastCheck = {
		help: 'ISO 8601 timestamp of last check',
		default: '',
		type: 'string',
		hidden: true,
	}

	static status = {
		help: 'Current watcher status',
		default: 'idle',
		type: 'string',
		options: [
			{ value: 'idle', label: 'Idle' },
			{ value: 'checking', label: 'Checking' },
			{ value: 'updated', label: 'Updated' },
			{ value: 'unchanged', label: 'Unchanged' },
			{ value: 'error', label: 'Error' },
		],
		hint: 'badge',
	}

	static autoConfirm = {
		help: 'Auto-confirm updates without asking user',
		default: false,
		type: 'boolean',
		hint: 'toggle',
	}

	static lastIndex = {
		help: 'Last known index object',
		default: null,
		hidden: true,
	}

	// ==========================================
	// 2. STATUS CONSTANTS
	// ==========================================

	static Status = {
		IDLE: 'idle',
		CHECKING: 'checking',
		UPDATED: 'updated',
		UNCHANGED: 'unchanged',
		ERROR: 'error',
	}

	// ==========================================
	// 3. UI PROJECTION (Zero Hardcode)
	// ==========================================

	static UI = {
		label_watching: 'Watching',
		label_updated: 'Catalog updated!',
		label_unchanged: 'No changes',
		label_checking: 'Checking for updates...',
		label_error: 'Check failed',
		label_interval: 'Check every {interval}s',
		label_lastCheck: 'Last check: {time}',
		label_items: '{count} items',
		label_version: 'v{version}',
		label_download: 'Download now?',
		label_downloaded: 'Catalog downloaded successfully',
		label_skipped: 'Update skipped by user',
		label_next_check: 'Next check in {seconds}s',
		error_no_url: 'Watcher URL is required',
		error_fetch: 'Failed to fetch index: {message}',
		error_parse: 'Failed to parse index: {message}',
		progress_init: 'Initializing watcher...',
		progress_checking: 'Checking {url}...',
	}

	// ==========================================
	// 4. ABORT DICTIONARY
	// ==========================================

	static abort = {
		user_cancelled: 'Watching cancelled by user',
		timeout: 'Watcher timed out',
	}

	// ==========================================
	// 6. AGNOSTIC LOGIC (Async Generator)
	// ==========================================

	/**
	 * Single check cycle. Returns whether catalog was updated.
	 *
	 * @param {{ fetch: (url: string, init?: RequestInit) => Promise<Response> }} env
	 * Environment-injected fetch (allows testing without real network).
	 */
	async *check(env) {
		if (!this.url) {
			yield log('error', CatalogWatcherModel.UI.error_no_url)
			return result({ updated: false, error: 'no_url' })
		}

		this.status = CatalogWatcherModel.Status.CHECKING
		yield progress(CatalogWatcherModel.UI.progress_checking)

		// 1. Try HEAD first for ETag comparison
		/** @type {string} */
		let remoteHash = ''
		/** @type {string} */
		let indexText = ''

		try {
			const headRes = await env.fetch(this.url, { method: 'HEAD' })

			if (headRes.status === 304) {
				// Server confirmed no change
				this.status = CatalogWatcherModel.Status.UNCHANGED
				this.lastCheck = new Date().toISOString()
				yield log('info', CatalogWatcherModel.UI.label_unchanged)
				return result({ updated: false })
			}

			const etag = headRes.headers?.get?.('etag')
			if (etag && this.lastHash && etag === this.lastHash) {
				// ETag matches — no change
				this.status = CatalogWatcherModel.Status.UNCHANGED
				this.lastCheck = new Date().toISOString()
				yield log('info', CatalogWatcherModel.UI.label_unchanged)
				return result({ updated: false })
			}

			// ETag changed or unavailable — fetch full content
			const getRes = await env.fetch(this.url)
			indexText = await getRes.text()
			remoteHash = etag || ''
		} catch (err) {
			this.status = CatalogWatcherModel.Status.ERROR
			yield log('error', CatalogWatcherModel.UI.error_fetch)
			return result({ updated: false, error: err?.message || 'fetch_error' })
		}

		// 2. Parse the index
		/** @type {CatalogIndexModel} */
		let index
		try {
			index = CatalogIndexModel.parse(indexText)
		} catch (err) {
			this.status = CatalogWatcherModel.Status.ERROR
			yield log('error', CatalogWatcherModel.UI.error_parse)
			return result({ updated: false, error: err?.message || 'parse_error' })
		}

		// 3. Use hash from index header if ETag was not available
		const effectiveHash = remoteHash || index.hash

		// 4. Compare hashes
		if (effectiveHash === this.lastHash) {
			this.status = CatalogWatcherModel.Status.UNCHANGED
			this.lastCheck = new Date().toISOString()
			yield log('info', CatalogWatcherModel.UI.label_unchanged)
			return result({ updated: false })
		}

		// 5. Catalog has changed!
		this.status = CatalogWatcherModel.Status.UPDATED
		yield log('success', CatalogWatcherModel.UI.label_updated)

		// 6. Ask user to confirm download (unless autoConfirm)
		let shouldDownload = this.autoConfirm
		if (!shouldDownload) {
			const response = yield ask('download', {
				help: CatalogWatcherModel.UI.label_download,
				type: 'boolean',
				default: true,
			})
			shouldDownload = response?.value !== false
		}

		if (!shouldDownload) {
			yield log('info', CatalogWatcherModel.UI.label_skipped)
			this.lastCheck = new Date().toISOString()
			return result({ updated: true, downloaded: false })
		}

		// 7. Update state
		this.lastHash = effectiveHash
		this.lastCheck = new Date().toISOString()
		this.lastIndex = index

		yield log('success', CatalogWatcherModel.UI.label_downloaded)

		return result({
			updated: true,
			downloaded: true,
			index: {
				catalog: index.catalog,
				locale: index.locale,
				version: index.version,
				hash: index.hash,
				itemCount: index.itemCount,
				files: index.files,
			},
		})
	}

	/**
	 * Continuous watching loop. Yields intents on every cycle.
	 * Runs indefinitely until adapter sends abort.
	 *
	 * @param {{ fetch: (url: string, init?: RequestInit) => Promise<Response>, sleep: (ms: number) => Promise<void> }} env
	 */
	async *watch(env) {
		if (!this.url) {
			yield log('error', CatalogWatcherModel.UI.error_no_url)
			return result({ cycles: 0 })
		}

		yield progress(CatalogWatcherModel.UI.progress_init)

		let cycles = 0

		while (true) {
			// Run a single check cycle
			const checkGen = this.check(env)
			let step = await checkGen.next()
			while (!step.done) {
				const response = yield step.value
				step = await checkGen.next(response)
			}

			cycles++

			// Wait for next interval
			yield progress(CatalogWatcherModel.UI.label_next_check)
			await env.sleep(this.interval * 1000)
		}
	}
}
