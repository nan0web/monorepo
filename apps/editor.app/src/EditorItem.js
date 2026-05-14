import { LitElement, html, css } from 'lit'
import { EditorModel } from '@nan0web/editor'

/**
 * nan0-editor-item
 *
 * Professional editor window with loading/saving feedback.
 */
export class EditorItem extends LitElement {
	static properties = {
		model: { type: Object },
		stack: { type: Object },
		isSaving: { type: Boolean },
		isLoading: { type: Boolean },
	}

	static styles = css`
		:host {
			display: flex;
			flex-direction: column;
			height: 100%;
			background: var(--ba-surface, transparent);
			color: var(--co-text, inherit);
			font-family: -apple-system, sans-serif;
			transition: opacity 0.3s;
		}
		:host([loading]) {
			opacity: 0.7;
			pointer-events: none;
		}
		header {
			padding: 0.75rem 1.5rem;
			background: var(--ba-header, #111);
			color: var(--co-header-text, #fff);
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
			font-size: 0.85rem;
		}
		.toolbar {
			padding: 0.6rem 1.5rem;
			background: var(--ba-panel, #fff);
			border-bottom: 1px solid var(--co-border, #e0e0e0);
			display: flex;
			gap: 0.8rem;
			align-items: center;
		}
		main {
			flex: 1;
			overflow-y: auto;
			padding: 2.5rem;
			max-width: 720px;
			margin: 0 auto;
			width: 100%;
		}
		.field {
			margin-bottom: 1.8rem;
		}
		.field label {
			display: block;
			font-size: 0.7rem;
			text-transform: uppercase;
			color: #888;
			margin-bottom: 0.6rem;
			font-weight: 700;
			letter-spacing: 0.05rem;
		}
		.field input,
		.field textarea {
			width: 100%;
			padding: 0.8rem 1rem;
			border: 1px solid var(--co-border, #dcdcdc);
			border-radius: 6px;
			font-size: 0.95rem;
			background: var(--ba-input, #fff);
			color: var(--co-text, #333);
			outline: none;
			transition: all 0.2s;
		}
		.field input:focus,
		.field textarea:focus {
			border-color: var(--co-accent, #0066cc);
			box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
		}
		.field textarea {
			height: 140px;
			resize: vertical;
		}
		.field-row {
			display: flex;
			align-items: stretch;
			gap: 0.4rem;
		}
		.field-row input {
			flex: 1;
		}
		.badge-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
			margin-top: 0.6rem;
		}
		.badge {
			padding: 0.2rem 0.6rem;
			background: var(--ba-hover, #e9ecef);
			border-radius: 4px;
			font-size: 0.7rem;
			color: var(--co-text, #495057);
			border: 1px solid var(--co-border, transparent);
		}
		button {
			background: var(--ba-panel, #fff);
			color: var(--co-text, #333);
			border: 1px solid var(--co-border, #dcdcdc);
			padding: 0.5rem 0.8rem;
			border-radius: 6px;
			cursor: pointer;
			font-size: 0.8rem;
			font-weight: 600;
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
		}
		button:hover {
			background: var(--ba-hover, #f8f9fa);
			border-color: var(--co-text, #adb5bd);
		}
		button.save {
			background: #10b981;
			border: none;
			color: #fff;
		}
		button.save.saving {
			background: #059669;
		}
		button.link {
			background: #0066cc;
			color: #fff;
			border: none;
		}
		button.close {
			background: #e11d48;
			color: #fff;
			border: none;
			font-size: 0.7rem;
		}
		.loading-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(255, 255, 255, 0.6);
			backdrop-filter: blur(2px);
			display: none;
			align-items: center;
			justify-content: center;
			z-index: 100;
		}
		:host([loading]) .loading-overlay {
			display: flex;
		}

		/* Themes */
		:host-context([theme='dark']) {
			--ba-surface: #1e1e1e;
			--ba-panel: #2a2a2a;
			--ba-input: #333;
			--ba-hover: #444;
			--co-text: #eee;
			--co-border: #444;
			--ba-header: #000;
		}
		:host-context([theme='contrast']) {
			--ba-surface: #000;
			--ba-panel: #000;
			--ba-input: #000;
			--ba-hover: #333;
			--co-text: #fff;
			--co-border: #fff;
			--co-accent: #ff0;
			--ba-header: #000;
		}
	`

	constructor() {
		super()
		this.isSaving = false
		this.isLoading = false
		this._pendingTags = {}
	}

	async firstUpdated() {
		this.isLoading = true
		this.setAttribute('loading', '')

		try {
			if (this.model) {
				await this.model.loadDocument()
			}
		} catch (e) {
			console.debug('[EditorItem] Failed to load', e)
		}

		this.isLoading = false
		this.removeAttribute('loading')

		setTimeout(() => {
			const firstInput = this.shadowRoot.querySelector('input, textarea')
			if (firstInput) firstInput.focus()
		}, 100)
	}

	render() {
		if (!this.model) return html`<div>Loading...</div>`
		const content = this.model.content || {}
		const schema = this.model.schema || {}

		return html`
			<div class="loading-overlay">⏳ Loading...</div>
			<header>
				<span class="title">📄 ${this.model.uri}</span>
				<button class="close" @click="${() => this.stack.pop()}">ESC</button>
			</header>
			<div class="toolbar">
				<button class="save ${this.isSaving ? 'saving' : ''}" @click="${() => this._handleSave()}">
					${this.isSaving ? '💾...' : '💾 Зберегти'}
				</button>
			</div>
			<main>
				<form @submit="${(e) => e.preventDefault()}">
					${Object.entries(schema).map(([key, field], idx) =>
						this._renderField(key, field, content[key], idx + 10),
					)}
				</form>
			</main>
		`
	}

	_renderField(key, field, value, tabIndex) {
		const type = field.type || 'string'

		if (type.startsWith('relation')) return this._renderReferenceField(key, field, value, tabIndex)
		if (type === 'string[]' || type === 'list')
			return this._renderListField(key, field, value, tabIndex * 10)
		if (type === 'text/markdown' || type === 'text')
			return this._renderMarkdownField(key, field, value, tabIndex)

		return html`
			<div class="field">
				<label>${key}</label>
				<input
					type="text"
					.value="${value || ''}"
					tabindex="${tabIndex}"
					placeholder="${field.placeholder || ''}"
					@input="${(e) => this._updateField(key, e.target.value)}"
				/>
			</div>
		`
	}

	_renderMarkdownField(key, field, value, tabIndex) {
		return html`
			<div class="field">
				<label>${key}</label>
				<textarea
					.value="${value || ''}"
					tabindex="${tabIndex}"
					placeholder="${field.placeholder || field.help || ''}"
					@input="${(e) => this._updateField(key, e.target.value)}"
				></textarea>
			</div>
		`
	}

	_renderReferenceField(key, field, value, tabIndex) {
		return html`
			<div class="field">
				<label>${key}</label>
				<div class="field-row">
					<input
						type="text"
						placeholder="Виберіть файл..."
						.value="${value || ''}"
						tabindex="${tabIndex}"
						@input="${(e) => this._updateField(key, e.target.value)}"
						@keydown="${(e) => this._handleRefKeydown(e, key, value)}"
					/>
					<button
						class="catalog"
						@click="${() => this._openCatalog(key, field)}"
						title="Вибрати (🔍)"
						tabindex="${tabIndex + 1}"
					>
						🔍
					</button>
					${value
						? html`
								<button
									class="link"
									@click="${() => this._openNested(value)}"
									title="Перейти (🔗)"
									tabindex="${tabIndex + 2}"
								>
									🔗
								</button>
							`
						: ''}
				</div>
			</div>
		`
	}

	_renderListField(key, field, value, tabIndex) {
		const arrayValue = Array.isArray(value) ? value : []
		const displayValue =
			this._pendingTags[key] !== undefined ? this._pendingTags[key] : arrayValue.join(', ')

		return html`
			<div class="field">
				<label>${key}</label>
				<input
					type="text"
					.value="${displayValue}"
					tabindex="${tabIndex}"
					placeholder="${field.placeholder || 'Tag 1, Tag 2, ...'}"
					@input="${(e) => this._handleTagInput(key, e.target.value)}"
					@blur="${() => this._commitTags(key)}"
				/>
				<div class="badge-list">
					${arrayValue.map((tag) => html`<span class="badge">#${tag}</span>`)}
				</div>
			</div>
		`
	}

	_handleTagInput(key, value) {
		this._pendingTags[key] = value

		// Reactive: parse and update model if it contains delimiters
		if (value.endsWith(',') || value.endsWith(' ')) {
			this._commitTags(key)
		} else {
			// Even without delimiters, we update the array if words are separated
			const words = value
				.split(/[,\s]+/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0)
			this._updateField(key, words)
		}
		this.requestUpdate()
	}

	_commitTags(key) {
		const value = this._pendingTags[key] || ''
		const array = value
			.split(/[,\s]+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
		this._updateField(key, array)
		delete this._pendingTags[key]
		this.requestUpdate()
	}

	_handleRefKeydown(e, key, value) {
		if (e.key === 'Enter') {
			e.preventDefault()
			if (value) this._openNested(value)
			else this._openCatalog(key, { type: 'reference' })
		}
	}

	async _handleSave() {
		this.isSaving = true
		await this.model.save()
		setTimeout(() => {
			this.isSaving = false
		}, 800)
	}

	_parseList(key, value) {
		const array = value
			.split(/[,\s]+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
		this._updateField(key, array)
	}

	_updateField(key, value) {
		this.model.updateContent({ ...this.model.content, [key]: value })
		this.requestUpdate()
	}

	_openCatalog(key, field) {
		const items = [
			{ name: 'Ярослав Снігірьов', uri: 'authors/yaro.json' },
			{ name: 'Олександр Снік', uri: 'authors/olexander.json' },
		]
		this.stack.push({
			isCatalog: true,
			path: 'authors/',
			items,
			onSelect: (uri) => {
				this._updateField(key, uri)
				this.stack.pop()
			},
		})
	}

	_openNested(uri) {
		console.debug(`[EditorItem] Pushing Nested: ${uri}`)
		const nested = new EditorModel({
			db: this.model.db,
			uri,
			initialContent: { name: 'Завантаження...' },
			mode: 'visual',
		})
		nested.schema = {
			name: { type: 'string', help: 'ПІБ' },
			photo: { type: 'reference', help: 'Шлях до фото' },
		}
		this.stack.push(nested)
	}
}

customElements.define('nan0-editor-item', EditorItem)
