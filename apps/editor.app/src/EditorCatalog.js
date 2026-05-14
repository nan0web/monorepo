import { LitElement, html, css } from 'lit'

/**
 * nan0-editor-catalog
 *
 * Centered modal for document selection with search and keyboard support.
 */
export class EditorCatalog extends LitElement {
	static properties = {
		path: { type: String },
		items: { type: Array },
		onSelect: { type: Function },
		selectedIndex: { type: Number },
		filter: { type: String },
	}

	static styles = css`
		:host {
			display: flex;
			align-items: center;
			justify-content: center;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--ba-overlay, rgba(0, 0, 0, 0.6));
			backdrop-filter: blur(8px);
			z-index: 2000;
			padding: 1rem;
		}
		.modal {
			display: flex;
			flex-direction: column;
			width: 100%;
			max-width: var(--modal-max-width, 580px);
			max-height: 85vh;
			background: var(--ba-surface, #fff);
			color: var(--co-text, #111);
			border-radius: 16px;
			box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
			border: 1px solid var(--co-border, transparent);
			overflow: hidden;
			animation: modalShow 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
		}
		@keyframes modalShow {
			from {
				transform: scale(0.9) translateY(20px);
				opacity: 0;
			}
			to {
				transform: scale(1) translateY(0);
				opacity: 1;
			}
		}
		header {
			padding: 1.25rem 1.5rem;
			background: var(--ba-header, #111);
			color: var(--co-header-text, #fff);
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.search-pane {
			padding: 1rem;
			background: var(--ba-panel, #f8f9fa);
			border-bottom: 1px solid var(--co-border, #eee);
		}
		.search-pane input {
			width: 100%;
			padding: 0.8rem 1rem;
			border: 2px solid var(--co-border, #ddd);
			background: var(--ba-input, #fff);
			color: var(--co-text, #111);
			border-radius: 8px;
			font-size: 1rem;
			outline: none;
			transition: border-color 0.2s;
		}
		.search-pane input:focus {
			border-color: var(--co-accent, #0066cc);
		}
		main {
			flex: 1;
			overflow-y: auto;
			padding: 1rem;
		}
		.list-item {
			padding: 1rem;
			background: var(--ba-surface, #fff);
			border-radius: 8px;
			margin-bottom: 0.6rem;
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			border: 1px solid var(--co-border, #eee);
			transition: all 0.2s;
		}
		.list-item.selected {
			border-color: var(--co-accent, #0066cc);
			background: var(--ba-hover, #f0f7ff);
			transform: translateX(4px);
		}
		.uri {
			font-family: monospace;
			font-size: 0.75rem;
			color: var(--co-dim-text, #888);
		}
		.hint {
			padding: 0.75rem 1.5rem;
			font-size: 0.75rem;
			color: var(--co-dim-text, #666);
			background: var(--ba-panel, #f1f3f5);
			display: flex;
			gap: 1.5rem;
			border-top: 1px solid var(--co-border, #eee);
		}
		button.close {
			background: #e11d48;
			color: white;
			border: none;
			padding: 0.5rem 1rem;
			border-radius: 6px;
			cursor: pointer;
			font-weight: 600;
		}
	`

	constructor() {
		super()
		this.items = []
		this.path = ''
		this.selectedIndex = 0
		this.filter = ''
		this._handleKeys = this._handleKeys.bind(this)
	}

	firstUpdated() {
		setTimeout(() => {
			this.renderRoot.querySelector('input').focus()
		}, 300)
		window.addEventListener('keydown', this._handleKeys)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		window.removeEventListener('keydown', this._handleKeys)
	}

	get _filteredItems() {
		if (!this.filter) return this.items
		const f = this.filter.toLowerCase()
		return this.items.filter((item) => (item.name || item.uri).toLowerCase().includes(f))
	}

	_handleKeys(e) {
		const items = this._filteredItems
		if (items.length === 0) return

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			this.selectedIndex = (this.selectedIndex + 1) % items.length
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length
		} else if (e.key === 'Enter') {
			e.preventDefault()
			this._handleSelect(items[this.selectedIndex].uri)
		}
	}

	render() {
		const items = this._filteredItems
		return html`
			<div class="modal">
				<header>
					<span>📂 Вибір: ${this.path}</span>
					<button class="close" @click="${() => this.dispatchEvent(new CustomEvent('close'))}">
						ESC
					</button>
				</header>
				<div class="search-pane">
					<input
						type="text"
						placeholder="Пошук у ${this.path}..."
						.value="${this.filter}"
						@input="${(e) => {
							this.filter = e.target.value
							this.selectedIndex = 0
						}}"
					/>
				</div>
				<main>
					${items.map(
						(item, index) => html`
							<div
								class="list-item ${index === this.selectedIndex ? 'selected' : ''}"
								@click="${() => this._handleSelect(item.uri)}"
							>
								<span class="name">📄 ${item.name || item.uri}</span>
								<span class="uri">${item.uri}</span>
							</div>
						`,
					)}
					${items.length === 0
						? html`<div style="padding: 2rem; text-align: center; color: #888;">
								Нічого не знайдено
							</div>`
						: ''}
				</main>
				<div class="hint">
					<span>↑↓ Навігація</span>
					<span>Enter Вибрати</span>
					<span>Esc Скасувати</span>
				</div>
			</div>
		`
	}

	_handleSelect(uri) {
		if (uri && this.onSelect) this.onSelect(uri)
	}
}

customElements.define('nan0-editor-catalog', EditorCatalog)
