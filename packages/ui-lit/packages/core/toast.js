import { LitElement, html, css } from 'lit'

/**
 * Toast — transient notification messages.
 *
 * OLMUI pair: @nan0web/ui-cli Toast → ui-lit Toast
 *
 * Auto-dismisses after `duration` ms. Can be stacked via container pattern.
 *
 * CSS Custom Properties:
 *   --ui-toast-bg, --ui-toast-fg, --ui-toast-border, --ui-toast-radius,
 *   --ui-toast-shadow, --ui-toast-progress
 *
 * @element ui-toast
 * @attr {string} message - Toast message text
 * @attr {'info'|'success'|'warning'|'error'} variant - Style variant
 * @attr {number} duration - Auto-dismiss time in ms (0 = persistent)
 * @attr {boolean} open - Whether the toast is shown
 * @attr {boolean} closable - Show close button
 * @fires toast-close - Dispatched when toast is closed
 */
class UIToast extends LitElement {
	static properties = {
		message: { type: String },
		variant: { type: String, reflect: true },
		duration: { type: Number },
		open: { type: Boolean, reflect: true },
		closable: { type: Boolean },
	}

	constructor() {
		super()
		this.message = ''
		this.variant = 'info'
		this.duration = 4000
		this.open = false
		this.closable = true
		this._timer = null
	}

	updated(changed) {
		if (changed.has('open') && this.open && this.duration > 0) {
			this._startTimer()
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this._timer)
	}

	_startTimer() {
		clearTimeout(this._timer)
		this._timer = setTimeout(() => this._close(), this.duration)
	}

	static styles = css`
		:host {
			display: block;
			--_radius: var(--ui-toast-radius, var(--ra-md, 12px));
			--_shadow: var(--ui-toast-shadow, 0 8px 24px rgba(0, 0, 0, 0.3));
		}

		:host(:not([open])) {
			display: none;
		}

		.toast {
			display: flex;
			align-items: flex-start;
			gap: 0.7rem;
			padding: 0.9rem 1.2rem;
			border-radius: var(--_radius);
			background: var(--_bg);
			color: var(--_fg);
			border-left: 4px solid var(--_accent);
			box-shadow: var(--_shadow);
			animation: toast-in 0.3s ease-out;
			position: relative;
			overflow: hidden;
		}

		@keyframes toast-in {
			from {
				opacity: 0;
				transform: translateX(20px);
			}
			to {
				opacity: 1;
				transform: translateX(0);
			}
		}

		/* Variants */
		:host,
		:host([variant='info']) {
			--_accent: var(--co, #3b82f6);
			--_bg: var(--ui-toast-bg, var(--ba-surface, #1e1e1e));
			--_fg: var(--ui-toast-fg, var(--fg, currentColor));
		}

		:host([variant='success']) {
			--_accent: var(--co-success, #22c55e);
			--_bg: var(--ui-toast-bg, var(--ba-surface, #1e1e1e));
			--_fg: var(--ui-toast-fg, var(--fg, currentColor));
		}

		:host([variant='warning']) {
			--_accent: var(--co-warn, #f59e0b);
			--_bg: var(--ui-toast-bg, var(--ba-surface, #1e1e1e));
			--_fg: var(--ui-toast-fg, var(--fg, currentColor));
		}

		:host([variant='error']) {
			--_accent: var(--co-danger, #ef4444);
			--_bg: var(--ui-toast-bg, var(--ba-surface, #1e1e1e));
			--_fg: var(--ui-toast-fg, var(--fg, currentColor));
		}

		.icon {
			flex-shrink: 0;
			width: 1.2em;
			height: 1.2em;
			margin-top: 0.1em;
			fill: var(--_accent);
		}

		.body {
			flex: 1;
			font-size: 0.9rem;
			line-height: 1.5;
		}

		.close {
			all: unset;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 24px;
			height: 24px;
			border-radius: var(--ra-sm, 4px);
			color: var(--fg-dim, rgba(255, 255, 255, 0.4));
			flex-shrink: 0;
			transition:
				background 0.15s,
				color 0.15s;
		}

		.close:hover {
			background: rgba(255, 255, 255, 0.08);
			color: var(--_fg);
		}

		.close svg {
			width: 14px;
			height: 14px;
			fill: currentColor;
		}

		/* Progress bar */
		.progress {
			position: absolute;
			bottom: 0;
			left: 0;
			height: 3px;
			background: var(--_accent);
			animation: toast-progress linear forwards;
			opacity: 0.6;
		}

		@keyframes toast-progress {
			from {
				width: 100%;
			}
			to {
				width: 0%;
			}
		}
	`

	_close() {
		this.open = false
		clearTimeout(this._timer)
		this.dispatchEvent(new CustomEvent('toast-close', { bubbles: true, composed: true }))
	}

	get _icon() {
		const v = this.variant
		if (v === 'success') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
				/>
			</svg>`
		}
		if (v === 'warning') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
			</svg>`
		}
		if (v === 'error') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
				/>
			</svg>`
		}
		return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
			/>
		</svg>`
	}

	render() {
		if (!this.open) return ''
		return html`
			<div class="toast" role="alert" aria-live="polite">
				${this._icon}
				<div class="body">${this.message || html`<slot></slot>`}</div>
				${this.closable
					? html` <button class="close" @click=${this._close} aria-label="Close">
							<svg viewBox="0 0 24 24">
								<path
									d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
								/>
							</svg>
						</button>`
					: ''}
				${this.duration > 0
					? html`<div class="progress" style="animation-duration: ${this.duration}ms"></div>`
					: ''}
			</div>
		`
	}
}

if (!customElements.get('ui-toast')) {
	customElements.define('ui-toast', UIToast)
}

export default UIToast
