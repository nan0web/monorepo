import { LitElement, html, css } from 'lit'

/**
 * Badge — small status pill label.
 *
 * OLMUI pair: @nan0web/ui-cli Badge (ANSI) → ui-lit Badge (Web Component)
 *
 * All colors via CSS Custom Properties — override in your theme:
 *   --ui-badge-bg, --ui-badge-fg, --ui-badge-border
 *   --ui-badge-radius, --ui-badge-font
 *
 * @element ui-badge
 * @attr {string} label - Text to display (fallback if no children)
 * @attr {'primary'|'secondary'|'info'|'ok'|'warn'|'err'} variant - Style variant
 */
class UIBadge extends LitElement {
	static properties = {
		label: { type: String },
		variant: { type: String, reflect: true },
	}

	constructor() {
		super()
		this.label = ''
		this.variant = 'primary'
	}

	static styles = css`
		:host {
			display: inline-block;
			--_radius: var(--ui-badge-radius, 999px);
			--_font: var(--ui-badge-font, var(--mono, 'JetBrains Mono', monospace));
		}

		span {
			display: inline-block;
			padding: 0.3em 0.85em;
			border-radius: var(--_radius);
			font-family: var(--_font);
			font-size: 0.82rem;
			font-weight: 600;
			letter-spacing: 0.04em;
			line-height: 1.4;
			background: var(--ui-badge-bg, var(--ba-surface, rgba(128, 128, 128, 0.15)));
			color: var(--ui-badge-fg, var(--fg, inherit));
			border: 1px solid var(--ui-badge-border, rgba(128, 128, 128, 0.25));
		}

		:host([variant='primary']) span {
			--ui-badge-bg: var(--co, #818cf8);
			--ui-badge-fg: var(--co-on, #fff);
			--ui-badge-border: transparent;
		}

		:host([variant='secondary']) span {
			--ui-badge-bg: var(--ba-surface, rgba(128, 128, 128, 0.2));
			--ui-badge-fg: var(--fg, inherit);
			--ui-badge-border: rgba(128, 128, 128, 0.3);
		}

		:host([variant='info']) span {
			--ui-badge-bg: var(--co-info, #3b82f6);
			--ui-badge-fg: var(--co-on-info, #fff);
			--ui-badge-border: transparent;
		}

		:host([variant='ok']) span {
			--ui-badge-bg: var(--co-success, #22c55e);
			--ui-badge-fg: var(--co-on-success, #000);
			--ui-badge-border: transparent;
		}

		:host([variant='warn']) span {
			--ui-badge-bg: var(--co-warn, #f59e0b);
			--ui-badge-fg: var(--co-on-warn, #000);
			--ui-badge-border: transparent;
		}

		:host([variant='err']) span {
			--ui-badge-bg: var(--co-danger, #ef4444);
			--ui-badge-fg: var(--co-on-danger, #fff);
			--ui-badge-border: transparent;
		}
	`

	render() {
		return html`<span><slot>${this.label}</slot></span>`
	}
}

if (!customElements.get('ui-badge')) {
	customElements.define('ui-badge', UIBadge)
}

export default UIBadge
