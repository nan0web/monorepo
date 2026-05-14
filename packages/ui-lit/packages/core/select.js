import { LitElement, html, css } from 'lit'

/**
 * Select — dropdown select component.
 *
 * OLMUI pair: @nan0web/ui-cli Select → ui-lit Select
 *
 * CSS Custom Properties:
 *   --ui-select-bg, --ui-select-fg, --ui-select-border, --ui-select-focus,
 *   --ui-select-radius, --ui-select-font, --ui-select-option-hover,
 *   --ui-select-option-active
 *
 * @element ui-select
 * @attr {string} label - Label text
 * @attr {string} placeholder - Placeholder when nothing selected
 * @attr {string} value - Current selected value
 * @attr {boolean} disabled - Disabled state
 * @prop {Array<{value: string, label: string}>} options - Selectable options
 * @fires select-change - detail: { value: string, label: string }
 */
class UISelect extends LitElement {
	static properties = {
		label: { type: String },
		placeholder: { type: String },
		value: { type: String },
		disabled: { type: Boolean, reflect: true },
		options: { type: Array },
		_open: { type: Boolean, state: true },
	}

	constructor() {
		super()
		this.label = ''
		this.placeholder = 'Select...'
		this.value = ''
		this.disabled = false
		this.options = []
		this._open = false
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
			--_bg: var(--ui-select-bg, var(--ba-surface, rgba(255, 255, 255, 0.05)));
			--_fg: var(--ui-select-fg, var(--fg, currentColor));
			--_border: var(--ui-select-border, var(--border, rgba(255, 255, 255, 0.12)));
			--_focus: var(--ui-select-focus, var(--co, #818cf8));
			--_radius: var(--ui-select-radius, var(--ra-md, 8px));
			--_font: var(--ui-select-font, inherit);
			--_option-hover: var(
				--ui-select-option-hover,
				color-mix(in srgb, var(--co, #818cf8) 12%, transparent)
			);
			--_option-active: var(
				--ui-select-option-active,
				color-mix(in srgb, var(--co, #818cf8) 18%, transparent)
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
			letter-spacing: 0.02em;
		}

		.trigger {
			all: unset;
			box-sizing: border-box;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.65em 0.9em;
			background: var(--_bg);
			color: var(--_fg);
			font-family: var(--_font);
			font-size: 0.9rem;
			border: 1.5px solid var(--_border);
			border-radius: var(--_radius);
			cursor: pointer;
			transition:
				border-color 0.2s,
				box-shadow 0.2s;
		}

		.trigger:focus {
			border-color: var(--_focus);
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--_focus) 20%, transparent);
		}

		.trigger .placeholder {
			color: var(--_placeholder);
		}

		.chevron {
			display: inline-block;
			width: 0;
			height: 0;
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
			border-top: 6px solid currentColor;
			transition: transform 0.2s;
			opacity: 0.5;
		}

		.chevron.open {
			transform: rotate(180deg);
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
			max-height: 260px;
			overflow-y: auto;
			animation: select-slide 0.15s ease-out;
		}

		.dropdown.open {
			display: block;
		}

		@keyframes select-slide {
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
			padding: 0.55em 0.8em;
			border-radius: var(--ra-sm, 4px);
			font-size: 0.88rem;
			color: var(--_fg);
			transition: background 0.15s;
		}

		.option:hover {
			background: var(--_option-hover);
		}

		.option:focus-visible {
			outline: 2px solid var(--_focus);
			outline-offset: -2px;
		}

		.option[aria-selected='true'] {
			background: var(--_option-active);
			font-weight: 600;
			color: var(--_focus);
		}
	`

	_toggle(e) {
		e.stopPropagation()
		this._open = !this._open
	}

	_selectOption(opt) {
		this.value = opt.value
		this._open = false
		this.dispatchEvent(
			new CustomEvent('select-change', {
				bubbles: true,
				composed: true,
				detail: { value: opt.value, label: opt.label },
			}),
		)
	}

	_onKeyDown(e) {
		if (e.key === 'Escape') this._open = false
	}

	get _selectedLabel() {
		const found = (this.options || []).find((o) => o.value === this.value)
		return found ? found.label : ''
	}

	render() {
		const selected = this._selectedLabel
		return html`
			<div class="field">
				${this.label ? html`<label>${this.label}</label>` : ''}
				<button
					class="trigger"
					@click=${this._toggle}
					@keydown=${this._onKeyDown}
					aria-haspopup="listbox"
					aria-expanded=${this._open}
					aria-label=${this.label || 'Select'}
				>
					${selected
						? html`<span>${selected}</span>`
						: html`<span class="placeholder">${this.placeholder}</span>`}
					<span class="chevron ${this._open ? 'open' : ''}"></span>
				</button>
				<div
					class="dropdown ${this._open ? 'open' : ''}"
					role="listbox"
					@keydown=${this._onKeyDown}
				>
					${(this.options || []).map(
						(opt) => html`
							<button
								class="option"
								role="option"
								aria-selected=${opt.value === this.value}
								@click=${() => this._selectOption(opt)}
							>
								${opt.label}
							</button>
						`,
					)}
				</div>
			</div>
		`
	}
}

if (!customElements.get('ui-select')) {
	customElements.define('ui-select', UISelect)
}

export default UISelect
