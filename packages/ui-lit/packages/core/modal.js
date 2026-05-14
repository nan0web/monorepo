import { LitElement, html, css } from 'lit'

/**
 * Modal — accessible dialog overlay.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Modal → ui-lit Modal
 *
 * CSS Custom Properties:
 *   --ui-modal-bg, --ui-modal-border, --ui-modal-radius, --ui-modal-shadow,
 *   --ui-modal-backdrop, --ui-modal-width, --ui-modal-fg
 *
 * @element ui-modal
 * @attr {string} title - Modal title
 * @attr {boolean} open - Whether the modal is shown
 * @attr {boolean} closable - Show close button (default true)
 * @slot - Default slot for body content
 * @slot footer - Footer content (action buttons)
 * @fires modal-close - Dispatched when modal is closed
 */
class UIModal extends LitElement {
	static properties = {
		title: { type: String },
		open: { type: Boolean, reflect: true },
		closable: { type: Boolean },
	}

	constructor() {
		super()
		this.title = ''
		this.open = false
		this.closable = true
		this._onEscape = this._onEscape.bind(this)
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this._onEscape)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('keydown', this._onEscape)
	}

	_onEscape(e) {
		if (e.key === 'Escape' && this.open && this.closable) {
			this._close()
		}
	}

	static styles = css`
		:host {
			display: contents;
			--_bg: var(--ui-modal-bg, var(--ba-surface, #1e1e1e));
			--_border: var(--ui-modal-border, var(--border, rgba(255, 255, 255, 0.1)));
			--_radius: var(--ui-modal-radius, var(--ra-lg, 16px));
			--_shadow: var(--ui-modal-shadow, 0 24px 64px rgba(0, 0, 0, 0.5));
			--_backdrop: var(--ui-modal-backdrop, rgba(0, 0, 0, 0.6));
			--_width: var(--ui-modal-width, 520px);
			--_fg: var(--ui-modal-fg, var(--fg, currentColor));
		}

		.backdrop {
			position: fixed;
			inset: 0;
			z-index: 10000;
			background: var(--_backdrop);
			display: flex;
			align-items: center;
			justify-content: center;
			animation: modal-fade 0.2s ease-out;
		}

		@keyframes modal-fade {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		.modal {
			background: var(--_bg);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			box-shadow: var(--_shadow);
			width: min(var(--_width), 92vw);
			max-height: 85vh;
			display: flex;
			flex-direction: column;
			color: var(--_fg);
			animation: modal-slide 0.25s ease-out;
		}

		@keyframes modal-slide {
			from {
				opacity: 0;
				transform: scale(0.95) translateY(10px);
			}
			to {
				opacity: 1;
				transform: scale(1) translateY(0);
			}
		}

		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1.2rem 1.5rem;
			border-bottom: 1px solid var(--_border);
		}

		.title {
			font-size: 1.1rem;
			font-weight: 700;
			margin: 0;
		}

		.close-btn {
			all: unset;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: var(--ra-md, 8px);
			color: var(--fg-dim, rgba(255, 255, 255, 0.5));
			transition:
				background 0.15s,
				color 0.15s;
		}

		.close-btn:hover {
			background: rgba(255, 255, 255, 0.08);
			color: var(--_fg);
		}

		.close-btn:focus-visible {
			outline: 2px solid var(--co, #818cf8);
			outline-offset: 2px;
		}

		.close-btn svg {
			width: 18px;
			height: 18px;
			fill: currentColor;
		}

		.body {
			padding: 1.5rem;
			overflow-y: auto;
			flex: 1;
		}

		.footer {
			padding: 1rem 1.5rem;
			border-top: 1px solid var(--_border);
			display: flex;
			justify-content: flex-end;
			gap: 0.5rem;
		}

		/* Hide when closed */
		:host(:not([open])) .backdrop {
			display: none;
		}
	`

	_close() {
		this.open = false
		this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }))
	}

	_onBackdropClick(e) {
		if (e.target === e.currentTarget && this.closable) {
			this._close()
		}
	}

	render() {
		if (!this.open) return ''
		return html`
			<div class="backdrop" @click=${this._onBackdropClick}>
				<div class="modal" role="dialog" aria-modal="true" aria-label=${this.title || 'Dialog'}>
					<div class="header">
						<h2 class="title">${this.title}</h2>
						${this.closable
							? html` <button class="close-btn" @click=${this._close} aria-label="Close">
									<svg viewBox="0 0 24 24">
										<path
											d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
										/>
									</svg>
								</button>`
							: ''}
					</div>
					<div class="body">
						<slot></slot>
					</div>
					<div class="footer">
						<slot name="footer"></slot>
					</div>
				</div>
			</div>
		`
	}
}

if (!customElements.get('ui-modal')) {
	customElements.define('ui-modal', UIModal)
}

export default UIModal
