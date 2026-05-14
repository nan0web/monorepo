import { runGenerator } from '@nan0web/ui/core'
import { CommentModel } from '../domain/CommentModel.js'

/**
 * @file WebCommentAdapter — Browser overlay adapter for CommentModel.
 *
 * Renders the comment overlay UI in the browser:
 *   - Spotlight (hover highlight) layer
 *   - Inline comment form (textarea + Ctrl+Enter)
 *   - Badges on commented elements
 *   - Dashboard dialog (export/import/clear)
 *   - Comment list panel (view/edit/delete)
 *
 * Zero hardcode: all text comes from CommentModel.UI / CommentModel.*.help.
 * Zero validation: all logic lives in CommentModel.run(), executed via runGenerator.
 */

/**
 * @typedef {Object} WebAdapterOptions
 * @property {HTMLElement} [root] — Container element (defaults to document.body).
 * @property {{ save: Function, loadAll: Function, remove: Function, clear: Function }} db — IndexedDB adapter.
 * @property {(key: string) => string} [t] — Optional i18n translation function.
 */

export class WebCommentAdapter {
	/** @type {HTMLElement} */
	#root

	/** @type {WebAdapterOptions['db']} */
	#db

	/** @type {(key: string) => string} */
	#t

	/** @type {AbortController | null} */
	#controller = null

	/** @type {HTMLElement | null} */
	#spotlightOverlay = null

	/** @type {HTMLElement | null} */
	#formContainer = null

	/** @type {HTMLElement | null} */
	#listPanel = null

	/**
	 * @param {WebAdapterOptions} options
	 */
	constructor({ root, db, t }) {
		this.#root = root || (typeof document !== 'undefined' ? document.body : null)
		this.#db = db
		this.#t = t || ((key) => key)
	}

	// ==========================================
	// PUBLIC API
	// ==========================================

	/**
	 * Start the comment overlay flow.
	 * @returns {Promise<*>} — Final result from the generator.
	 */
	async start() {
		const model = new CommentModel()
		const env = {
			db: this.#db,
			getViewport: () => ({
				w: typeof window !== 'undefined' ? window.innerWidth : 0,
				h: typeof window !== 'undefined' ? window.innerHeight : 0,
			}),
		}

		this.#controller = new AbortController()

		const result = await runGenerator(model.run(env), {
			ask: (intent) => this.#handleAsk(intent),
			progress: (intent) => this.#handleProgress(intent),
			log: (intent) => this.#handleLog(intent),
			result: (intent) => this.#handleResult(intent),
		}, {
			signal: this.#controller.signal,
		})

		this.#cleanup()
		return result
	}

	/**
	 * Abort the current flow.
	 */
	stop() {
		if (this.#controller) {
			this.#controller.abort()
		}
		this.#cleanup()
	}

	/**
	 * Show all existing comments in a list panel.
	 */
	async showCommentList() {
		let comments = await this.#db.loadAll()
		if (typeof window !== 'undefined') {
			const currentUrl = window.location.pathname
			comments = comments.filter(c => c.url === currentUrl || !c.url)
		}
		this.#createCommentList(comments)
	}

	// ==========================================
	// INTENT HANDLERS (Adapter → Model)
	// ==========================================

	/**
	 * @param {import('@nan0web/ui/core').AskIntent} intent
	 * @returns {Promise<import('@nan0web/ui/core').AskResponse>}
	 */
	async #handleAsk(intent) {
		switch (intent.field) {
			case 'mode':
				return this.#askMode(intent)
			case 'targetRef':
				return this.#askTargetRef(intent)
			case 'text':
				return this.#askText(intent)
			case 'dashboard':
				return this.#askDashboard(intent)
			case 'importFile':
				return this.#askImportFile(intent)
			default:
				return { value: intent.schema?.default ?? '' }
		}
	}

	/**
	 * @param {import('@nan0web/ui/core').ProgressIntent} intent
	 */
	#handleProgress(intent) {
		this.#showToast(intent.message, 'info')
	}

	/**
	 * @param {import('@nan0web/ui/core').LogIntent} intent
	 */
	#handleLog(intent) {
		this.#showToast(intent.message, intent.level)
	}

	/**
	 * @param {import('@nan0web/ui/core').ResultIntent} intent
	 */
	#handleResult(_intent) {
		this.#cleanup()
	}

	// ==========================================
	// ASK HANDLERS (UI Interaction)
	// ==========================================

	/**
	 * Activation — immediately return current activation mode.
	 */
	async #askMode(intent) {
		if (intent.value === 'list_only') {
			this.showCommentList()
		}
		return { value: CommentModel.Mode.TOGGLE }
	}

	/**
	 * Spotlight mode — user clicks an element.
	 * Hides overlay pointer-events during elementFromPoint for accurate detection.
	 */
	async #askTargetRef(_intent) {
		return new Promise((resolve) => {
			this.#createSpotlight(resolve)
		})
	}

	/**
	 * Comment text — show a textarea form.
	 * Supports Ctrl+Enter to submit, Escape to cancel.
	 */
	async #askText(intent) {
		return new Promise((resolve) => {
			this.#createForm(
				intent.schema?.help || CommentModel.UI.label_form_title,
				'textarea',
				(value) => resolve({ value }),
				() => resolve({ value: '', cancelled: true }),
			)
		})
	}

	/**
	 * Dashboard — show export/import/clear/list options dialog.
	 */
	async #askDashboard(intent) {
		return new Promise((resolve) => {
			const dialog = this.#createDialog(intent.schema?.help || CommentModel.UI.label_dashboard)
			const options = intent.schema?.options || []

			for (const opt of options) {
				const btn = document.createElement('button')
				btn.className = 'nan0-comment-btn'
				btn.textContent = this.#t(opt.label)
				btn.addEventListener('click', () => {
					dialog.remove()
					resolve({ value: opt.value })
				})
				dialog.querySelector('.nan0-comment-dialog-body')?.append(btn)
			}
		})
	}

	/**
	 * Import file — file picker returning parsed JSON.
	 */
	async #askImportFile(_intent) {
		return new Promise((resolve) => {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = '.json'
			input.addEventListener('change', async () => {
				const file = input.files?.[0]
				if (!file) return resolve({ value: null, cancelled: true })
				try {
					const text = await file.text()
					resolve({ value: JSON.parse(text) })
				} catch {
					resolve({ value: null, cancelled: true })
				}
			})
			input.click()
		})
	}

	// ==========================================
	// DOM BUILDERS (Private)
	// ==========================================

	/**
	 * Spotlight overlay with proper element detection.
	 * Key fix: hides overlay pointer-events during elementFromPoint
	 * so the browser can see the actual element beneath.
	 * @param {(response: {value: string, cancelled?: boolean}) => void} onSelect
	 */
	#createSpotlight(onSelect) {
		const overlay = document.createElement('div')
		overlay.className = 'nan0-comment-spotlight'
		overlay.setAttribute('data-active', 'true')

		/** @type {HTMLElement | null} */
		let highlighted = null

		/**
		 * Get element under cursor by temporarily hiding the overlay.
		 */
		const getElementUnder = (x, y) => {
			overlay.style.pointerEvents = 'none'
			const el = document.elementFromPoint(x, y)
			overlay.style.pointerEvents = 'auto'
			return el
		}

		const onMove = (/** @type {MouseEvent} */ e) => {
			const el = getElementUnder(e.clientX, e.clientY)
			if (el && el !== highlighted) {
				if (highlighted) highlighted.classList.remove('nan0-comment-highlight')
				highlighted = /** @type {HTMLElement} */ (el)
				highlighted.classList.add('nan0-comment-highlight')
			}
		}

		const onClick = (/** @type {MouseEvent} */ e) => {
			e.preventDefault()
			e.stopPropagation()

			const el = /** @type {HTMLElement} */ (getElementUnder(e.clientX, e.clientY))
			cleanup()

			const ref = el?.id
				? `#${el.id}`
				: this.#buildSelector(el)

			onSelect({ value: ref })
		}

		const onEsc = (/** @type {KeyboardEvent} */ e) => {
			if (e.key === 'Escape') {
				cleanup()
				onSelect({ value: '', cancelled: true })
			}
		}

		const cleanup = () => {
			if (highlighted) highlighted.classList.remove('nan0-comment-highlight')
			overlay.remove()
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('click', onClick, true)
			document.removeEventListener('keydown', onEsc)
		}

		this.#root.append(overlay)
		document.addEventListener('mousemove', onMove)
		document.addEventListener('click', onClick, true)
		document.addEventListener('keydown', onEsc)

		this.#spotlightOverlay = overlay
	}

	/**
	 * Comment form with Ctrl+Enter to submit, Escape to cancel, Tab support.
	 * @param {string} label
	 * @param {'text' | 'textarea'} inputType
	 * @param {(value: string) => void} onSubmit
	 * @param {() => void} onCancel
	 */
	#createForm(label, inputType, onSubmit, onCancel) {
		const container = document.createElement('div')
		container.className = 'nan0-comment-form'

		const title = document.createElement('div')
		title.className = 'nan0-comment-form-title'
		title.textContent = this.#t(label)
		container.append(title)

		const input = inputType === 'textarea'
			? document.createElement('textarea')
			: document.createElement('input')
		input.className = 'nan0-comment-input'
		input.setAttribute('placeholder', this.#t(CommentModel.text.help))
		if (input instanceof HTMLInputElement) input.type = 'text'
		container.append(input)

		// Hint: Ctrl+Enter to save
		const hint = document.createElement('div')
		hint.className = 'nan0-comment-form-hint'
		hint.textContent = 'Ctrl+Enter — save · Escape — cancel'
		container.append(hint)

		const actions = document.createElement('div')
		actions.className = 'nan0-comment-actions'

		const doSubmit = () => {
			const val = input.value
			container.remove()
			this.#formContainer = null
			onSubmit(val)
		}

		const doCancel = () => {
			container.remove()
			this.#formContainer = null
			onCancel()
		}

		const submitBtn = document.createElement('button')
		submitBtn.className = 'nan0-comment-btn nan0-comment-btn-primary'
		submitBtn.textContent = this.#t(CommentModel.UI.icon_submit)
		submitBtn.addEventListener('click', doSubmit)

		const cancelBtn = document.createElement('button')
		cancelBtn.className = 'nan0-comment-btn'
		cancelBtn.textContent = this.#t(CommentModel.UI.icon_cancel)
		cancelBtn.addEventListener('click', doCancel)

		// Keyboard: Ctrl+Enter to save, Escape to cancel
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault()
				doSubmit()
			}
			if (e.key === 'Escape') {
				e.preventDefault()
				doCancel()
			}
		})

		actions.append(submitBtn, cancelBtn)
		container.append(actions)

		this.#root.append(container)
		this.#formContainer = container
		input.focus()
	}

	/**
	 * @param {string} title
	 * @returns {HTMLElement}
	 */
	#createDialog(title) {
		const dialog = document.createElement('div')
		dialog.className = 'nan0-comment-dialog'

		const header = document.createElement('div')
		header.className = 'nan0-comment-dialog-header'
		header.textContent = this.#t(title)
		dialog.append(header)

		const body = document.createElement('div')
		body.className = 'nan0-comment-dialog-body'
		dialog.append(body)

		this.#root.append(dialog)
		return dialog
	}

	/**
	 * Render a scrollable list of all comments with edit/delete actions.
	 * @param {Array<{targetRef: string, text: string, timestamp: string}>} comments
	 */
	#createCommentList(comments) {
		// Remove previous panel if exists
		if (this.#listPanel) {
			this.#listPanel.remove()
			this.#listPanel = null
		}

		const panel = document.createElement('div')
		panel.className = 'nan0-comment-list-panel'

		// Header
		const header = document.createElement('div')
		header.className = 'nan0-comment-list-header'

		const heading = document.createElement('span')
		heading.textContent = this.#t(CommentModel.UI.label_dashboard)
			+ ` (${comments.length})`
		header.append(heading)

		const closeBtn = document.createElement('button')
		closeBtn.className = 'nan0-comment-btn'
		closeBtn.textContent = '✕'
		closeBtn.addEventListener('click', () => {
			panel.remove()
			this.#listPanel = null
		})
		header.append(closeBtn)
		panel.append(header)

		// Body
		const body = document.createElement('div')
		body.className = 'nan0-comment-list-body'

		if (comments.length === 0) {
			const empty = document.createElement('div')
			empty.className = 'nan0-comment-list-empty'
			empty.textContent = this.#t(CommentModel.UI.label_no_comments)
			body.append(empty)
		} else {
			comments.forEach((comment, index) => {
				const item = this.#createCommentItem(comment, index, panel)
				body.append(item)
			})
		}

		panel.append(body)

		// Footer with Import, Export, Clear buttons
		const footer = document.createElement('div')
		footer.className = 'nan0-comment-list-footer'

		const importBtn = document.createElement('button')
		importBtn.className = 'nan0-comment-btn secondary'
		importBtn.textContent = this.#t(CommentModel.UI.label_import)
		importBtn.addEventListener('click', () => this.#handleImport())
		footer.append(importBtn)

		if (comments.length > 0) {
			const exportBtn = document.createElement('button')
			exportBtn.className = 'nan0-comment-btn secondary'
			exportBtn.textContent = this.#t(CommentModel.UI.label_export)
			exportBtn.addEventListener('click', () => this.#handleExport())
			footer.append(exportBtn)

			const clearBtn = document.createElement('button')
			clearBtn.className = 'nan0-comment-btn danger'
			clearBtn.textContent = this.#t(CommentModel.UI.label_clear)
			clearBtn.addEventListener('click', async () => {
				await this.#db.clear()
				this.showCommentList()
			})
			footer.append(clearBtn)
		}

		panel.append(footer)

		this.#root.append(panel)
		this.#listPanel = panel
	}

	/**
	 * Render a single comment item with edit/delete.
	 * @param {{ targetRef: string, text: string, timestamp: string }} comment
	 * @param {number} index
	 * @param {HTMLElement} panel
	 * @returns {HTMLElement}
	 */
	#createCommentItem(comment, index, panel) {
		const item = document.createElement('div')
		item.className = 'nan0-comment-list-item'

		const target = document.createElement('div')
		target.className = 'nan0-comment-list-target'
		target.textContent = comment.targetRef
		target.style.cursor = 'pointer'
		target.addEventListener('click', () => {
			this.#highlightElement(comment.targetRef)
		})
		item.append(target)

		const text = document.createElement('div')
		text.className = 'nan0-comment-list-text'
		text.textContent = comment.text
		item.append(text)

		const time = document.createElement('div')
		time.className = 'nan0-comment-list-time'
		time.textContent = new Date(comment.timestamp).toLocaleString()
		item.append(time)

		const actions = document.createElement('div')
		actions.className = 'nan0-comment-list-actions'

		// Edit button
		const editBtn = document.createElement('button')
		editBtn.className = 'nan0-comment-btn'
		editBtn.textContent = '✏️'
		editBtn.addEventListener('click', () => {
			// Replace text with editable textarea
			const textarea = document.createElement('textarea')
			textarea.className = 'nan0-comment-input'
			textarea.value = comment.text
			text.replaceWith(textarea)
			textarea.focus()

			// Replace edit button with save button
			const saveBtn = document.createElement('button')
			saveBtn.className = 'nan0-comment-btn nan0-comment-btn-primary'
			saveBtn.textContent = this.#t(CommentModel.UI.icon_submit)
			saveBtn.addEventListener('click', async () => {
				comment.text = textarea.value
				// Re-save: remove old, add updated
				const all = await this.#db.loadAll()
				all[index] = comment
				await this.#db.clear()
				for (const c of all) await this.#db.save(c)
				// Refresh list
				this.showCommentList()
			})
			editBtn.replaceWith(saveBtn)

			// Ctrl+Enter in edit mode
			textarea.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
					e.preventDefault()
					saveBtn.click()
				}
			})
		})

		// Delete button
		const delBtn = document.createElement('button')
		delBtn.className = 'nan0-comment-btn'
		delBtn.textContent = '🗑️'
		delBtn.addEventListener('click', async () => {
			const all = await this.#db.loadAll()
			all.splice(index, 1)
			await this.#db.clear()
			for (const c of all) await this.#db.save(c)
			this.showCommentList()
		})

		actions.append(editBtn, delBtn)
		item.append(actions)

		return item
	}

	/**
	 * @param {string} message
	 * @param {'info' | 'warn' | 'error' | 'success'} level
	 */
	#showToast(message, level = 'info') {
		const toast = document.createElement('div')
		toast.className = `nan0-comment-toast nan0-comment-toast-${level}`
		toast.textContent = this.#t(message)
		this.#root.append(toast)
		setTimeout(() => toast.remove(), 3000)
	}

	/**
	 * Build a unique CSS selector for an element.
	 * @param {HTMLElement} el
	 * @returns {string}
	 */
	#buildSelector(el) {
		if (!el || el === document.body) return 'body'
		const tag = el.tagName.toLowerCase()
		const parent = el.parentElement
		if (!parent) return tag
		const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName)
		if (siblings.length === 1) {
			return `${this.#buildSelector(parent)} > ${tag}`
		}
		const index = siblings.indexOf(el) + 1
		return `${this.#buildSelector(parent)} > ${tag}:nth-of-type(${index})`
	}

	async #handleExport() {
		try {
			const comments = await this.#db.loadAll()
			if (!comments || comments.length === 0) return
			
			const blob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `nan0-comments-${new Date().toISOString().split('T')[0]}.json`
			
			// Small hack to ensure click works in all browsers before removing
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			
			URL.revokeObjectURL(url)
			const msg = this.#t(CommentModel.UI.label_exported).replace('{count}', comments.length.toString())
			this.#showToast(msg, 'success')
		} catch (error) {
			console.error(error)
		}
	}

	#handleImport() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.json'
		input.onchange = async (e) => {
			const file = e.target.files?.[0]
			if (!file) return

			try {
				const text = await file.text()
				const items = JSON.parse(text)
				if (!Array.isArray(items)) {
					throw new Error('Import data must be a JSON array')
				}

				for (const item of items) {
					await this.#db.save(item)
				}
				
				const msg = this.#t(CommentModel.UI.label_imported).replace('{count}', items.length.toString())
				this.#showToast(msg, 'success')
				
				// Refresh the view
				if (this.#listPanel) {
					this.showCommentList()
				}
			} catch (err) {
				console.error('Import error:', err)
				this.#showToast(this.#t(CommentModel.UI.error_import_invalid), 'error')
			}
		}
		input.click()
	}

	/**
	 * Highlight an element on the page by its CSS selector.
	 * Scrolls into view and adds a temporary highlight pulse.
	 * @param {string} selector
	 */
	#highlightElement(selector) {
		try {
			const el = document.querySelector(selector)
			if (!el) return

			// Remove previous highlights
			document.querySelectorAll('.nan0-comment-highlight')
				.forEach((h) => h.classList.remove('nan0-comment-highlight'))

			// Minimize list panel so the highlighted element is visible
			if (this.#listPanel) {
				this.#listPanel.style.opacity = '0.15'
				this.#listPanel.style.pointerEvents = 'none'
				this.#listPanel.style.transition = 'opacity 0.2s ease'
			}

			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('nan0-comment-highlight')

			setTimeout(() => {
				el.classList.remove('nan0-comment-highlight')
				if (this.#listPanel) {
					this.#listPanel.style.opacity = '1'
					this.#listPanel.style.pointerEvents = 'auto'
				}
			}, 2000)
		} catch {
			// Invalid selector — ignore
		}
	}

	#cleanup() {
		if (this.#spotlightOverlay) {
			this.#spotlightOverlay.remove()
			this.#spotlightOverlay = null
		}
		if (this.#formContainer) {
			this.#formContainer.remove()
			this.#formContainer = null
		}
	}
}
