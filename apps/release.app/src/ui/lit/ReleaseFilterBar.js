import { LitElement, html, css } from 'lit'

/**
 * ReleaseFilterBar - Interactive filter chips and search bar for ReleaseDashboard.
 *
 * @element release-filter-bar
 * @prop {string} filter - Current status filter ('all'|'wip'|'closed')
 * @prop {string} priority - Priority filter ('all'|'0'|'1'|'2'|'3')
 * @prop {string} search - Search query
 * @prop {Array<any>} bookmarks - Bookmark items
 */
export class ReleaseFilterBar extends LitElement {
	static properties = {
		filter: { type: String },
		priority: { type: String },
		search: { type: String },
		bookmarks: { type: Array },
	}

	constructor() {
		super()
		this.filter = 'all'
		this.priority = 'all'
		this.search = ''
		this.bookmarks = []
	}

	static styles = css`
		:host {
			display: block;
			margin-bottom: 1.5rem;
		}
		.filter-container {
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem;
			align-items: center;
			background: var(--ui-card-bg, rgba(255, 255, 255, 0.04));
			padding: 1rem 1.25rem;
			border-radius: 12px;
			border: 1px solid var(--ui-card-border, rgba(255, 255, 255, 0.08));
		}
		.search-input {
			flex: 1;
			min-width: 220px;
			padding: 0.5rem 0.85rem;
			border-radius: 8px;
			border: 1px solid rgba(255, 255, 255, 0.15);
			background: rgba(0, 0, 0, 0.2);
			color: inherit;
			font-family: inherit;
		}
		.chip-group {
			display: flex;
			gap: 0.4rem;
		}
		.chip {
			padding: 0.35rem 0.75rem;
			border-radius: 20px;
			font-size: 0.82rem;
			cursor: pointer;
			background: rgba(255, 255, 255, 0.06);
			border: 1px solid rgba(255, 255, 255, 0.12);
			color: inherit;
			transition: all 0.2s;
		}
		.chip.active {
			background: var(--co, #818cf8);
			color: #fff;
			border-color: var(--co, #818cf8);
		}
	`

	_onSearch(e) {
		this.search = e.target.value
		this.dispatchEvent(new CustomEvent('filter-change', {
			detail: { filter: this.filter, priority: this.priority, search: this.search },
			bubbles: true,
			composed: true,
		}))
	}

	_setFilter(val) {
		this.filter = val
		this.dispatchEvent(new CustomEvent('filter-change', {
			detail: { filter: this.filter, priority: this.priority, search: this.search },
			bubbles: true,
			composed: true,
		}))
	}

	_setPriority(prio) {
		this.priority = prio
		this.dispatchEvent(new CustomEvent('filter-change', {
			detail: { filter: this.filter, priority: this.priority, search: this.search },
			bubbles: true,
			composed: true,
		}))
	}

	render() {
		return html`
			<div class="filter-container">
				<input
					type="text"
					class="search-input"
					placeholder="Пошук проєктів, тегів, завдань..."
					.value=${this.search}
					@input=${this._onSearch}
				/>
				<div class="chip-group">
					<button
						type="button"
						class="chip ${this.filter === 'all' ? 'active' : ''}"
						@click=${() => this._setFilter('all')}
					>
						Всі
					</button>
					<button
						type="button"
						class="chip ${this.filter === 'wip' ? 'active' : ''}"
						@click=${() => this._setFilter('wip')}
					>
						WIP
					</button>
					<button
						type="button"
						class="chip ${this.filter === 'closed' ? 'active' : ''}"
						@click=${() => this._setFilter('closed')}
					>
						Closed
					</button>
				</div>
				<div class="chip-group">
					<button
						type="button"
						class="chip ${this.priority === 'all' ? 'active' : ''}"
						@click=${() => this._setPriority('all')}
					>
						Всі Prio
					</button>
					<button
						type="button"
						class="chip ${this.priority === '0' ? 'active' : ''}"
						@click=${() => this._setPriority('0')}
					>
						🔥 P0
					</button>
					<button
						type="button"
						class="chip ${this.priority === '1' ? 'active' : ''}"
						@click=${() => this._setPriority('1')}
					>
						⚡ P1
					</button>
					<button
						type="button"
						class="chip ${this.priority === '2' ? 'active' : ''}"
						@click=${() => this._setPriority('2')}
					>
						📋 P2
					</button>
				</div>
			</div>
		`
	}
}

if (!customElements.get('release-filter-bar')) {
	customElements.define('release-filter-bar', ReleaseFilterBar)
}

export default ReleaseFilterBar
