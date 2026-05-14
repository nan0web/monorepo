import { resolveDefaults } from '@nan0web/types'
import { ask, progress, log, result } from '@nan0web/ui/core'

/**
 * @file CommentModel — Model-as-Schema for the universal comment/feedback overlay.
 *
 * A single comment attached to a DOM element or document section.
 * Activation modes: URL param (?comment=on), hotkey (Alt/Option), nav toggle (💬).
 *
 * Works as the OLMUI generator — the entire app logic lives here.
 * UI Adapters (Web overlay, CLI inspector, test harness) only react to yielded intents.
 */
export class CommentModel {
	// ==========================================
	// 1. MODEL AS SCHEMA (Static Definition)
	// ==========================================

	static targetRef = {
		help: 'CSS selector or element ID of the commented element',
		default: '',
		type: 'string',
		hidden: true,
	}

	static text = {
		help: 'Comment body (supports markdown)',
		default: '',
		type: 'text/markdown',
		hint: 'textarea',
		positional: true,
		validate: (val) => (typeof val === 'string' && val.trim().length > 0) || 'error_text_required',
	}

	static author = {
		help: 'Author name or identifier',
		default: '',
		type: 'text',
		hint: 'text',
	}

	static url = {
		help: 'Page URL where the comment was made',
		default: '',
		type: 'string',
		hidden: true,
	}

	static timestamp = {
		help: 'ISO 8601 creation timestamp',
		default: '',
		type: 'datetime',
		hidden: true,
	}

	static viewport = {
		help: 'Device viewport at time of comment',
		default: null,
		type: 'object',
		hidden: true,
	}

	// ==========================================
	// 2. ACTIVATION MODE ENUM
	// ==========================================

	static mode = {
		help: 'Activation mode for the comment overlay',
		default: 'off',
		type: 'string',
		options: [
			{ value: 'off', label: 'mode_off' },
			{ value: 'url', label: 'mode_url' },
			{ value: 'hotkey', label: 'mode_hotkey' },
			{ value: 'toggle', label: 'mode_toggle' },
		],
		hint: 'badge',
	}

	static Mode = {
		OFF: 'off',
		URL: 'url',
		HOTKEY: 'hotkey',
		TOGGLE: 'toggle',
	}

	// ==========================================
	// 3. UI PROJECTION (Zero Hardcode)
	// ==========================================

	static UI = {
		// Labels
		label_title: 'Comment',
		label_activate: 'Activate comment mode',
		label_deactivate: 'Deactivate comment mode',
		label_spotlight: 'Spotlight active — hover to highlight, click to comment',
		label_select_element: 'Click on an element to add a comment',
		label_form_title: 'New Comment',
		label_badge: '💬',
		label_badge_count: '{count} comments',
		label_saved: 'Comment saved',
		label_deleted: 'Comment deleted',
		label_no_comments: 'No comments yet',
		label_read_comment: '{author}: {text}',
		label_timestamp: 'Created: {time}',

		// Dashboard
		label_dashboard: 'Comment Dashboard',
		label_export: 'Export JSON',
		label_import: 'Import JSON',
		label_clear: 'Clear all comments',
		label_exported: 'Exported {count} comments',
		label_imported: 'Imported {count} comments',
		label_cleared: 'All comments cleared',

		// Errors
		error_text_required: 'Comment text cannot be empty',
		error_no_target: 'No target element selected',
		error_save_failed: 'Failed to save comment: {message}',
		error_import_invalid: 'Invalid import file format',
		error_export_empty: 'No comments to export',

		// Progress
		progress_init: 'Initializing comment overlay...',
		progress_saving: 'Saving comment...',
		progress_loading: 'Loading comments...',
		progress_exporting: 'Exporting comments...',
		progress_importing: 'Importing comments...',
		progress_clearing: 'Clearing all comments...',

		// Mode labels
		mode_off: 'Off',
		mode_url: 'URL param',
		mode_hotkey: 'Hotkey (Alt/Option)',
		mode_toggle: 'Nav Toggle',

		// Icons
		icon_submit: '✓',
		icon_cancel: '✕',
		icon_close: 'Close',
	}

	// ==========================================
	// 4. ABORT DICTIONARY
	// ==========================================

	static abort = {
		user_cancelled: 'Comment cancelled by user',
		escape_pressed: 'Dismissed via Escape',
	}

	// ==========================================
	// 5. INSTANCE FIELDS
	// ==========================================

	/** @type {string} */
	targetRef = CommentModel.targetRef.default
	/** @type {string} */
	text = CommentModel.text.default
	/** @type {string} */
	author = CommentModel.author.default
	/** @type {string} */
	timestamp = CommentModel.timestamp.default
	/** @type {{ w: number, h: number } | null} */
	viewport = CommentModel.viewport.default
	/** @type {string} */
	mode = CommentModel.mode.default

	/**
	 * @param {Partial<CommentModel>} [data]
	 */
	constructor(data = {}) {
		Object.assign(this, resolveDefaults(CommentModel, data))
	}

	// ==========================================
	// 6. AGNOSTIC LOGIC — Main Flow (Async Generator)
	// ==========================================

	/**
	 * Main flow (Generator):
	 * Activates spotlight mode to select an element and add a comment.
	 */
	async *run(env) {
		yield progress(CommentModel.UI.progress_init)

		// Step 0: Activation mode
		const modeResponse = yield ask('mode', CommentModel.mode)
		if (modeResponse?.cancelled) return result({ status: 'cancelled', reason: 'activation' })
		this.mode = modeResponse.value

		const res = yield* this.createCommentFlow(env)
		if (res?.data?.status !== 'ok') return res

		// After creation, trigger the list view (via specific intent)
		yield ask('mode', { value: 'list_only', hidden: true })

		return res
	}

	/**
	 * Flow for creating a new comment.
	 */
	async *createCommentFlow(env) {
		// Step 1: Spotlight mode — wait for element selection
		yield progress(CommentModel.UI.label_spotlight)

		const target = yield ask('targetRef', CommentModel.targetRef)
		if (target?.cancelled) return result({ status: 'cancelled', reason: 'target_selection' })

		if (!target?.value) {
			yield log('error', CommentModel.UI.error_no_target)
			return result({ status: 'error', reason: 'no_target' })
		}
		this.targetRef = target.value

		// Step 2: Collect comment text
		const textResponse = yield ask('text', CommentModel.text)
		if (textResponse?.cancelled) return result({ status: 'cancelled', reason: 'text_input' })

		const validation = CommentModel.text.validate(textResponse?.value)
		if (validation !== true) {
			yield log('error', CommentModel.UI.error_text_required)
			return result({ status: 'error', reason: 'validation_failed' })
		}
		this.text = textResponse.value

		// Step 3: Capture context
		this.timestamp = new Date().toISOString()
		this.viewport = env.getViewport ? env.getViewport() : null
		this.url = env.getUrl ? env.getUrl() : (typeof window !== 'undefined' ? window.location.pathname : '')

		// Step 4: Save
		yield progress(CommentModel.UI.progress_saving)
		try {
			await env.db.save({
				targetRef: this.targetRef,
				text: this.text,
				author: this.author,
				timestamp: this.timestamp,
				viewport: this.viewport,
				url: this.url,
			})
			yield log('success', CommentModel.UI.label_saved)
			return result({ status: 'ok', action: 'created', data: { status: 'ok', action: 'created' } })
		} catch (err) {
			const message = err?.message || 'Unknown error'
			yield log('error', CommentModel.UI.error_save_failed.replace('{message}', message))
			return result({ status: 'error', reason: 'save_failed', message })
		}
	}

	// ==========================================
	// 7. SUB-GENERATORS (Export / Import / Clear)
	// ==========================================

	/**
	 * Export all comments from storage as JSON.
	 * @param {{ db: { loadAll: Function } }} env
	 */
	async *exportComments(env) {
		yield progress(CommentModel.UI.progress_exporting)

		const comments = await env.db.loadAll()
		if (!comments || comments.length === 0) {
			yield log('warn', CommentModel.UI.error_export_empty)
			return { count: 0 }
		}

		yield log('success', CommentModel.UI.label_exported)
		return { count: comments.length, data: comments }
	}

	/**
	 * Import comments from a JSON payload provided by the adapter.
	 * @param {{ db: { save: Function } }} env
	 */
	async *importComments(env) {
		yield progress(CommentModel.UI.progress_importing)

		const fileResponse = yield ask('importFile', {
			help: CommentModel.UI.label_import,
			type: 'file',
			default: null,
		})

		if (fileResponse?.cancelled || !fileResponse?.value) {
			return { count: 0 }
		}

		const items = fileResponse.value
		if (!Array.isArray(items)) {
			yield log('error', CommentModel.UI.error_import_invalid)
			return { count: 0, error: 'invalid_format' }
		}

		for (const item of items) {
			await env.db.save(item)
		}

		yield log('success', CommentModel.UI.label_imported)
		return { count: items.length }
	}

	/**
	 * Clear all comments from storage.
	 * @param {{ db: { clear: Function } }} env
	 */
	async *clearComments(env) {
		yield progress(CommentModel.UI.progress_clearing)
		await env.db.clear()
		yield log('success', CommentModel.UI.label_cleared)
	}
}
