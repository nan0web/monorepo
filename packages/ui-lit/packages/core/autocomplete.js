import { LitElement, html, css } from 'lit'

/**
 * Autocomplete — input with filterable suggestion list.
 *
 * OLMUI pair: @nan0web/ui-cli Autocomplete → ui-react Autocomplete → ui-lit Autocomplete
 *
 * CSS Custom Properties:
 *   --ui-auto-bg, --ui-auto-fg, --ui-auto-border, --ui-auto-focus,
 *   --ui-auto-radius, --ui-auto-highlight
 *
 * @element ui-autocomplete
 * @attr {string} label - Label text
 * @attr {string} placeholder - Placeholder text
 * @attr {string} value - Current value
 * @attr {boolean} disabled - Disabled state
 * @prop {Array<string|{value: string, label: string}>} options - Suggestions
 * @fires auto-select - detail: { value: string }
 */
class UIAutocomplete extends LitElement {
	static properties = {
		label: { type: String },
		placeholder: { type: String },
		value: { type: String },
		disabled: { type: Boolean, reflect: true },
		options: { type: Array },
		_query: { type: String, state: true },
		_open: { type: Boolean, state: true },
		_activeIndex: { type: Number, state: true },
	}

	constructor() {
		super()
		this.label = ''
		this.placeholder = 'Type to search...'
		this.value = ''
		this.disabled = false
		this.options = []
		this._query = ''
		this._open = false
		this._activeIndex = -1
		this._onOutsideClick = this._onOutsideClick.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('click', this._onOutsideClick)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('click', this._onOutsideClick)
	}

	_onOutsideClick(e) {
		if (this._open && !this.contains(e.composedPath?.()?.[0] || e.target)) {
			this._open = false
		}
	}

	static styles = css`
		:host {
			display: block;
			position: relative;
			--_bg: var(--ui-auto-bg, var(--ba-surface, rgba(255, 255, 255, 0.05)));
			--_fg: var(--ui-auto-fg, var(--fg, currentColor));
			--_border: var(--ui-auto-border, var(--border, rgba(255, 255, 255, 0.12)));
			--_focus: var(--ui-auto-focus, var(--co, #818cf8));
			--_radius: var(--ui-auto-radius, var(--ra-md, 8px));
			--_highlight: var(
				--ui-auto-highlight,
				color-mix(in srgb, var(--co, #818cf8) 15%, transparent)
			);
			--_label-color: var(--fg-dim, rgba(255, 255, 255, 0.6));
			--_placeholder: var(--fg-dim, rgba(255, 255, 255, 0.3));
		}

		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}

		.field {
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}

		label {
			font-size: 0.82rem;
			font-weight: 600;
			color: var(--_label-color);
		}

		input {
			all: unset;
			box-sizing: border-box;
			width: 100%;
			padding: 0.65em 0.9em;
			background: var(--_bg);
			color: var(--_fg);
			font-size: 0.9rem;
			border: 1.5px solid var(--_border);
			border-radius: var(--_radius);
			transition:
				border-color 0.2s,
				box-shadow 0.2s;
		}

		input::placeholder {
			color: var(--_placeholder);
		}

		input:focus {
			border-color: var(--_focus);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--_focus) 20%, transparent);
		}

		.dropdown {
			display: none;
			position: absolute;
			top: calc(100% + 4px);
			left: 0;
			right: 0;
			background: var(--ba-surface, #1e1e1e);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
			padding: 0.3rem;
			z-index: 100;
			max-height: 220px;
			overflow-y: auto;
			animation: auto-slide 0.15s ease-out;
		}

		.dropdown.open {
			display: block;
		}

		@keyframes auto-slide {
			from {
				opacity: 0;
				transform: translateY(-4px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.option {
			all: unset;
			display: block;
			width: 100%;
			box-sizing: border-box;
			cursor: pointer;
			padding: 0.5em 0.8em;
			border-radius: var(--ra-sm, 4px);
			font-size: 0.88rem;
			color: var(--_fg);
			transition: background 0.15s;
		}

		.option:hover,
		.option.active {
			background: var(--_highlight);
		}

		.option:focus-visible {
			outline: 2px solid var(--_focus);
			outline-offset: -2px;
		}

		.no-results {
			padding: 0.6em 0.8em;
			font-size: 0.82rem;
			color: var(--_label-color);
			font-style: italic;
		}

		mark {
			background: color-mix(in srgb, var(--_focus) 30%, transparent);
			color: inherit;
			border-radius: 2px;
			padding: 0 1px;
		}
	`

	get _filtered() {
		const q = this._query.toLowerCase().trim()
		if (!q) return this.options || []
		return (this.options || []).filter((opt) => {
			const label = typeof opt === 'string' ? opt : opt.label
			return label.toLowerCase().includes(q)
		})
	}

	_getLabel(opt) {
		return typeof opt === 'string' ? opt : opt.label
	}

	_getValue(opt) {
		return typeof opt === 'string' ? opt : opt.value
	}

	_onInput(e) {
		this._query = e.target.value
		this._open = true
		this._activeIndex = -1
	}

	_select(opt) {
		const val = this._getValue(opt)
		this.value = val
		this._query = this._getLabel(opt)
		this._open = false
		this.dispatchEvent(
			new CustomEvent('auto-select', {
				bubbles: true,
				composed: true,
				detail: { value: val },
			}),
		)
	}

	_onKeyDown(e) {
		const filtered = this._filtered
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			this._activeIndex = Math.min(this._activeIndex + 1, filtered.length - 1)
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			this._activeIndex = Math.max(this._activeIndex - 1, 0)
		} else if (e.key === 'Enter' && this._activeIndex >= 0 && this._activeIndex < filtered.length) {
			e.preventDefault()
			this._select(filtered[this._activeIndex])
		} else if (e.key === 'Escape') {
			this._open = false
		}
	}

	render() {
		const filtered = this._filtered
		return html`
			<div class="field">
				${this.label ? html`<label>${this.label}</label>` : ''}
				<input
					.value=${this._query || this.value}
					placeholder=${this.placeholder}
					?disabled=${this.disabled}
					@input=${this._onInput}
					@focus=${() => {
						this._open = true
					}}
					@keydown=${this._onKeyDown}
					aria-label=${this.label || 'Autocomplete'}
					aria-autocomplete="list"
					role="combobox"
					aria-expanded=${this._open}
				/>
				<div class="dropdown ${this._open && filtered.length ? 'open' : ''}" role="listbox">
					${filtered.length === 0 && this._query
						? html`<div class="no-results">No results</div>`
						: filtered.map(
								(opt, i) => html`
									<button
										class="option ${i === this._activeIndex ? 'active' : ''}"
										role="option"
										@click=${() => this._select(opt)}
									>
										${this._getLabel(opt)}
									</button>
								`,
							)}
				</div>
			</div>
		`
	}
}

if (!customElements.get('ui-autocomplete')) {
	customElements.define('ui-autocomplete', UIAutocomplete)
}

export default UIAutocomplete
