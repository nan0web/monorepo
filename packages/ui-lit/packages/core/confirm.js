import { LitElement, html, css } from 'lit'

/**
 * Confirm — confirmation dialog (inline or modal-like).
 *
 * OLMUI pair: @nan0web/ui-cli Confirm → ui-lit Confirm
 *
 * Two modes:
 *   - Inline: shows Yes/No buttons inline
 *   - Modal: fullscreen backdrop overlay
 *
 * CSS Custom Properties:
 *   --ui-confirm-bg, --ui-confirm-fg, --ui-confirm-border,
 *   --ui-confirm-radius, --ui-confirm-backdrop
 *
 * @element ui-confirm
 * @attr {string} message - Confirmation message
 * @attr {string} confirm-label - Confirm button text (default: "Confirm")
 * @attr {string} cancel-label - Cancel button text (default: "Cancel")
 * @attr {boolean} open - Whether the dialog is shown
 * @attr {boolean} modal - Fullscreen backdrop mode
 * @fires confirm-yes - User confirmed
 * @fires confirm-no - User cancelled
 */
class UIConfirm extends LitElement {
	static properties = {
		message: { type: String },
		confirmLabel: { type: String, attribute: 'confirm-label' },
		cancelLabel: { type: String, attribute: 'cancel-label' },
		open: { type: Boolean, reflect: true },
		modal: { type: Boolean },
	}

	constructor() {
		super()
		this.message = 'Are you sure?'
		this.confirmLabel = 'Confirm'
		this.cancelLabel = 'Cancel'
		this.open = false
		this.modal = false
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-confirm-bg, var(--ba-surface, #1e1e1e));
			--_fg: var(--ui-confirm-fg, var(--fg, currentColor));
			--_border: var(--ui-confirm-border, var(--border, rgba(255, 255, 255, 0.1)));
			--_radius: var(--ui-confirm-radius, var(--ra-lg, 16px));
			--_backdrop: var(--ui-confirm-backdrop, rgba(0, 0, 0, 0.6));
		}

		:host(:not([open])) {
			display: none;
		}

		.backdrop {
			position: fixed;
			inset: 0;
			background: var(--_backdrop);
			z-index: 9999;
			display: flex;
			align-items: center;
			justify-content: center;
			animation: confirm-fade 0.2s ease-out;
		}

		@keyframes confirm-fade {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		.dialog {
			background: var(--_bg);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			padding: 1.5rem 2rem;
			max-width: 420px;
			width: 90%;
			box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
			animation: confirm-slide 0.25s ease-out;
		}

		@keyframes confirm-slide {
			from {
				opacity: 0;
				transform: scale(0.95) translateY(8px);
			}
			to {
				opacity: 1;
				transform: scale(1) translateY(0);
			}
		}

		.inline-dialog {
			display: flex;
			align-items: center;
			gap: 1rem;
			padding: 0.8rem 1rem;
			background: var(--_bg);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
		}

		.message {
			color: var(--_fg);
			font-size: 0.95rem;
			line-height: 1.5;
			margin-bottom: 1.2rem;
		}

		.inline-dialog .message {
			margin-bottom: 0;
			flex: 1;
		}

		.actions {
			display: flex;
			gap: 0.6rem;
			justify-content: flex-end;
		}

		button {
			all: unset;
			cursor: pointer;
			padding: 0.5em 1.1em;
			border-radius: var(--ra-md, 8px);
			font-size: 0.88rem;
			font-weight: 600;
			transition:
				background 0.2s,
				color 0.2s;
			white-space: nowrap;
		}

		button:focus-visible {
			outline: 2px solid var(--co, #818cf8);
			outline-offset: 2px;
		}

		.btn-confirm {
			background: var(--co, #818cf8);
			color: var(--co-on, #fff);
		}

		.btn-confirm:hover {
			background: color-mix(in srgb, var(--co, #818cf8) 85%, black);
		}

		.btn-cancel {
			background: var(--ba-surface, rgba(255, 255, 255, 0.08));
			color: var(--_fg);
		}

		.btn-cancel:hover {
			background: rgba(255, 255, 255, 0.12);
		}
	`

	_confirm() {
		this.open = false
		this.dispatchEvent(new CustomEvent('confirm-yes', { bubbles: true, composed: true }))
	}

	_cancel() {
		this.open = false
		this.dispatchEvent(new CustomEvent('confirm-no', { bubbles: true, composed: true }))
	}

	_onKeyDown(e) {
		if (e.key === 'Escape') this._cancel()
		if (e.key === 'Enter') this._confirm()
	}

	render() {
		if (!this.open) return ''

		const actions = html`
			<div class="actions">
				<button class="btn-cancel" @click=${this._cancel}>${this.cancelLabel}</button>
				<button class="btn-confirm" @click=${this._confirm}>${this.confirmLabel}</button>
			</div>
		`

		if (this.modal) {
			return html`
				<div class="backdrop" @click=${this._cancel} @keydown=${this._onKeyDown}>
					<div class="dialog" @click=${(e) => e.stopPropagation()}>
						<div class="message">${this.message}</div>
						${actions}
					</div>
				</div>
			`
		}

		return html`
			<div class="inline-dialog" @keydown=${this._onKeyDown}>
				<div class="message">${this.message}</div>
				${actions}
			</div>
		`
	}
}

if (!customElements.get('ui-confirm')) {
	customElements.define('ui-confirm', UIConfirm)
}

export default UIConfirm
