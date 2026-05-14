import { LitElement, html, css } from 'lit'

/**
 * Toggle — on/off switch control.
 *
 * OLMUI pair: @nan0web/ui-cli Toggle → ui-lit Toggle
 *
 * CSS Custom Properties:
 *   --ui-toggle-track-bg, --ui-toggle-track-active, --ui-toggle-thumb,
 *   --ui-toggle-thumb-active, --ui-toggle-width, --ui-toggle-height
 *
 * @element ui-toggle
 * @attr {string} label - Label text
 * @attr {boolean} checked - Current state
 * @attr {boolean} disabled - Disabled state
 * @fires toggle-change - detail: { checked: boolean }
 */
class UIToggle extends LitElement {
	static properties = {
		label: { type: String },
		checked: { type: Boolean, reflect: true },
		disabled: { type: Boolean, reflect: true },
	}

	constructor() {
		super()
		this.label = ''
		this.checked = false
		this.disabled = false
	}

	static styles = css`
		:host {
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			--_track-bg: var(--ui-toggle-track-bg, rgba(255, 255, 255, 0.12));
			--_track-active: var(--ui-toggle-track-active, var(--co, #818cf8));
			--_thumb: var(--ui-toggle-thumb, rgba(255, 255, 255, 0.85));
			--_thumb-active: var(--ui-toggle-thumb-active, #fff);
			--_width: var(--ui-toggle-width, 44px);
			--_height: var(--ui-toggle-height, 24px);
		}

		:host([disabled]) {
			opacity: 0.45;
			pointer-events: none;
		}

		.track {
			all: unset;
			position: relative;
			display: inline-flex;
			align-items: center;
			width: var(--_width);
			height: var(--_height);
			background: var(--_track-bg);
			border-radius: calc(var(--_height) / 2);
			cursor: pointer;
			transition: background 0.25s ease;
		}

		.track:focus-visible {
			outline: 2px solid var(--_track-active);
			outline-offset: 2px;
		}

		:host([checked]) .track {
			background: var(--_track-active);
		}

		.thumb {
			position: absolute;
			left: 3px;
			width: calc(var(--_height) - 6px);
			height: calc(var(--_height) - 6px);
			background: var(--_thumb);
			border-radius: 50%;
			transition:
				transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
				background 0.25s;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		}

		:host([checked]) .thumb {
			transform: translateX(calc(var(--_width) - var(--_height)));
			background: var(--_thumb-active);
		}

		.label {
			font-size: 0.88rem;
			color: var(--fg, currentColor);
			user-select: none;
			cursor: pointer;
		}
	`

	_toggle() {
		if (this.disabled) return
		this.checked = !this.checked
		this.dispatchEvent(
			new CustomEvent('toggle-change', {
				bubbles: true,
				composed: true,
				detail: { checked: this.checked },
			}),
		)
	}

	render() {
		return html`
			<button
				class="track"
				role="switch"
				aria-checked=${this.checked}
				aria-label=${this.label || 'Toggle'}
				?disabled=${this.disabled}
				@click=${this._toggle}
			>
				<span class="thumb"></span>
			</button>
			${this.label ? html`<span class="label" @click=${this._toggle}>${this.label}</span>` : ''}
		`
	}
}

if (!customElements.get('ui-toggle')) {
	customElements.define('ui-toggle', UIToggle)
}

export default UIToggle
