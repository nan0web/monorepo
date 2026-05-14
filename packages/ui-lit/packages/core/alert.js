import { LitElement, html, css } from 'lit'

/**
 * Alert — universal notification / callout block.
 *
 * OLMUI pair: @nan0web/ui-cli Alert → ui-react-bootstrap Callout → ui-lit Alert
 *
 * Unified component that replaces the concept of "Callout" across all UI
 * adapters. Supports VitePress-style types (tip, warning, info, danger)
 * which map to standard variants.
 *
 * CSS Custom Properties:
 *   --ui-alert-bg, --ui-alert-fg, --ui-alert-accent, --ui-alert-icon-color,
 *   --ui-alert-radius, --ui-alert-border-width
 *
 * @element ui-alert
 * @attr {'info'|'ok'|'warn'|'err'} variant - Style variant
 * @attr {boolean} open - Whether the alert is visible
 * @prop {string} title - Optional heading text
 * @prop {string} content - Body text (alternative to <slot>)
 */
class UIAlert extends LitElement {
	static properties = {
		variant: { type: String, reflect: true },
		open: { type: Boolean },
		title: { type: String },
		content: { type: String },
		icon: { type: String },
	}

	constructor() {
		super()
		this.variant = 'info'
		this.open = true
		this.title = ''
		this.content = ''
		this.icon = ''
	}

	/** Normalize variant aliases */
	get _effectiveVariant() {
		return this.variant
	}

	static styles = css`
		:host {
			display: block;
			--_radius: var(--ui-alert-radius, var(--ra-md, 12px));
			--_border-w: var(--ui-alert-border-width, 3px);
		}

		:host([open='false']) {
			display: none;
		}

		.alert {
			display: flex;
			align-items: flex-start;
			gap: 0.8rem;
			padding: 1rem 1.2rem;
			border-radius: var(--_radius);
			border-left: var(--_border-w) solid var(--_accent);
			background: var(--_bg);
			color: var(--_fg);
		}

		/* Variant: Info (default) */
		:host,
		:host([variant='info']),
		:host([variant='tip']) {
			--_accent: var(--ui-alert-accent, var(--co, #3b82f6));
			--_bg: var(--ui-alert-bg, color-mix(in srgb, var(--_accent) 8%, transparent));
			--_fg: var(--ui-alert-fg, var(--fg, currentColor));
			--_icon-color: var(--ui-alert-icon-color, var(--_accent));
		}

		:host([variant='ok']),
		:host([variant='success']) {
			--_accent: var(--co-success, #22c55e);
			--_bg: color-mix(in srgb, var(--_accent) 8%, transparent);
			--_icon-color: var(--_accent);
		}

		:host([variant='warn']),
		:host([variant='warning']) {
			--_accent: var(--co-warn, #f59e0b);
			--_bg: color-mix(in srgb, var(--_accent) 8%, transparent);
			--_icon-color: var(--_accent);
		}

		:host([variant='err']),
		:host([variant='error']),
		:host([variant='danger']) {
			--_accent: var(--co-danger, #ef4444);
			--_bg: color-mix(in srgb, var(--_accent) 8%, transparent);
			--_icon-color: var(--_accent);
		}

		.icon {
			flex-shrink: 0;
			width: 1.3em;
			height: 1.3em;
			margin-top: 0.15em;
			fill: var(--_icon-color);
		}

		.body {
			flex: 1;
			min-width: 0;
		}

		.heading {
			font-weight: 700;
			font-size: 0.95rem;
			margin-bottom: 0.3em;
			color: var(--_icon-color);
		}

		.content {
			font-size: 0.9rem;
			line-height: 1.6;
			white-space: pre-line;
			word-wrap: break-word;
		}

		::slotted(*) {
			margin: 0;
		}
	`

	get _icon() {
		const v = this._effectiveVariant
		if (v === 'ok') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
				/>
			</svg>`
		}
		if (v === 'warn') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
			</svg>`
		}
		if (v === 'err') {
			return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
				/>
			</svg>`
		}
		// info (default)
		return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
			/>
		</svg>`
	}

	render() {
		if (!this.open) return ''
		return html`
			<div class="alert" role="alert">
				${this.icon ? html`<span class="icon">${this.icon}</span>` : this._icon}
				<div class="body">
					${this.title ? html`<div class="heading">${this.title}</div>` : ''}
					<div class="content">${this.content || html`<slot></slot>`}</div>
				</div>
			</div>
		`
	}
}

if (!customElements.get('ui-alert')) {
	customElements.define('ui-alert', UIAlert)
}

export default UIAlert
