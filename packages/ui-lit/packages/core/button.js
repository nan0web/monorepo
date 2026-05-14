import { LitElement, html, css } from 'lit'

/**
 * Button — universal action button with variants and sizing.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Button → ui-lit Button
 *
 * CSS Custom Properties:
 *   --ui-btn-bg, --ui-btn-fg, --ui-btn-border, --ui-btn-hover-bg,
 *   --ui-btn-radius, --ui-btn-font, --ui-btn-shadow
 *
 * @element ui-button
 * @attr {string} label - Button text (alternative to slot)
 * @attr {'primary'|'secondary'|'info'|'ok'|'warn'|'err'|'ghost'} variant - Style variant
 * @attr {'sm'|'md'|'lg'} size - Button size
 * @attr {boolean} disabled - Disabled state
 * @attr {boolean} loading - Loading state (shows spinner)
 * @attr {boolean} outline - Outline appearance (transparent background, colored border)
 * @fires btn-click - Dispatched on click
 */
class UIButton extends LitElement {
	static properties = {
		label: { type: String },
		variant: { type: String, reflect: true },
		size: { type: String, reflect: true },
		disabled: { type: Boolean, reflect: true },
		loading: { type: Boolean, reflect: true },
		outline: { type: Boolean, reflect: true },
	}

	constructor() {
		super()
		this.label = ''
		this.variant = 'primary'
		this.size = 'md'
		this.disabled = false
		this.loading = false
		this.outline = false
	}

	static styles = css`
		:host {
			display: inline-block;
			--_radius: var(--ui-btn-radius, var(--ra-md, 8px));
			--_font: var(--ui-btn-font, inherit);
			--_shadow: var(--ui-btn-shadow, none);
		}

		:host([disabled]),
		:host([loading]) {
			pointer-events: none;
		}

		:host([disabled]) button {
			opacity: 0.45;
			cursor: not-allowed;
		}

		button {
			all: unset;
			box-sizing: border-box;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.5em;
			cursor: pointer;
			font-family: var(--_font);
			font-weight: 600;
			border-radius: var(--_radius);
			box-shadow: var(--_shadow);
			border: 1.5px solid transparent;
			transition:
				background 0.2s,
				color 0.2s,
				border-color 0.2s,
				transform 0.1s,
				box-shadow 0.2s;
			white-space: nowrap;
			user-select: none;
		}

		button:active {
			transform: scale(0.97);
		}

		button:focus-visible {
			outline: 2px solid var(--co, #818cf8);
			outline-offset: 2px;
		}

		/* Sizes */
		:host([size='sm']) button {
			padding: 0.35em 0.8em;
			font-size: 0.8rem;
		}

		:host,
		:host([size='md']) button {
			padding: 0.55em 1.2em;
			font-size: 0.9rem;
		}

		:host([size='lg']) button {
			padding: 0.75em 1.8em;
			font-size: 1rem;
		}

		/* --- Variables for base variants --- */
		:host,
		:host([variant='primary']) {
			--btn-base: var(--ui-btn-bg, var(--co, #818cf8));
			--btn-on-base: var(--ui-btn-fg, var(--co-on, #fff));
		}

		:host([variant='secondary']) {
			--btn-base: var(--ba-surface, rgba(255, 255, 255, 0.08));
			--btn-on-base: var(--fg, currentColor);
		}

		:host([variant='info']) {
			--btn-base: var(--co-info, #3b82f6);
			--btn-on-base: var(--co-on-info, #fff);
		}

		:host([variant='ok']) {
			--btn-base: var(--co-success, #22c55e);
			--btn-on-base: var(--co-on-success, #000);
		}

		:host([variant='warn']) {
			--btn-base: var(--co-warn, #f59e0b);
			--btn-on-base: var(--co-on-warn, #000);
		}

		:host([variant='err']) {
			--btn-base: var(--co-danger, #ef4444);
			--btn-on-base: var(--co-on-danger, #fff);
		}

		/* Generic Button Styles (Solid) applying chosen variables */
		:host(:not([variant='ghost'])) button {
			background: var(--btn-base);
			color: var(--btn-on-base);
		}

		:host(:not([variant='ghost'])) button:hover {
			background: color-mix(in srgb, var(--btn-base) 85%, black);
		}

		/* Outline Modifier */
		:host([outline]:not([variant='ghost'])) button {
			background: transparent;
			color: var(--btn-base);
			border-color: var(--btn-base);
		}

		:host([variant='secondary'][outline]) button {
			color: var(--fg, currentColor);
			border-color: var(--border-bright, rgba(128, 128, 128, 0.4));
		}

		:host([outline]:not([variant='ghost'])) button:hover {
			background: color-mix(in srgb, var(--btn-base) 10%, transparent);
		}

		:host([variant='secondary'][outline]) button:hover {
			background: var(--ba-surface, rgba(255, 255, 255, 0.08));
			border-color: var(--fg, currentColor);
		}

		/* Ghost Variant */
		:host([variant='ghost']) button {
			background: transparent;
			color: var(--fg, currentColor);
			border-color: transparent;
		}

		:host([variant='ghost']) button:hover {
			background: var(--ba-surface, rgba(255, 255, 255, 0.06));
		}

		/* Spinner animation */
		.spinner {
			width: 1em;
			height: 1em;
			border: 2px solid transparent;
			border-top-color: currentColor;
			border-radius: 50%;
			animation: btn-spin 0.6s linear infinite;
		}

		@keyframes btn-spin {
			to {
				transform: rotate(360deg);
			}
		}
	`

	_onClick() {
		if (!this.disabled && !this.loading) {
			this.dispatchEvent(
				new CustomEvent('btn-click', {
					bubbles: true,
					composed: true,
				}),
			)
		}
	}

	render() {
		return html`
			<button
				@click=${this._onClick}
				?disabled=${this.disabled}
				aria-busy=${this.loading}
				aria-label=${this.label || 'Button'}
			>
				${this.loading ? html`<span class="spinner"></span>` : ''}
				${this.label ? this.label : html`<slot></slot>`}
			</button>
		`
	}
}

if (!customElements.get('ui-button')) {
	customElements.define('ui-button', UIButton)
}

export default UIButton
