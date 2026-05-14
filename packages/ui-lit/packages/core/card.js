import { LitElement, html, css } from 'lit'

/**
 * Card — content container with optional header, body, and footer.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Card → ui-lit Card
 *
 * CSS Custom Properties:
 *   --ui-card-bg, --ui-card-border, --ui-card-radius, --ui-card-shadow,
 *   --ui-card-padding, --ui-card-fg, --ui-card-header-border
 *
 * @element ui-card
 * @attr {string} title - Card header title
 * @attr {string} subtitle - Card subtitle
 * @attr {string} image - Image URL for card header
 * @attr {boolean} hoverable - Enable hover lift effect
 * @slot header - Custom header content
 * @slot - Default slot for body content
 * @slot footer - Footer content
 */
class UICard extends LitElement {
	static properties = {
		title: { type: String },
		subtitle: { type: String },
		content: { type: String },
		image: { type: String },
		hoverable: { type: Boolean, reflect: true },
	}

	constructor() {
		super()
		this.title = ''
		this.subtitle = ''
		this.content = ''
		this.image = ''
		this.hoverable = false
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-card-bg, var(--ba-surface, rgba(255, 255, 255, 0.04)));
			--_border: var(--ui-card-border, var(--border, rgba(255, 255, 255, 0.08)));
			--_radius: var(--ui-card-radius, var(--ra-lg, 16px));
			--_shadow: var(--ui-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.15));
			--_padding: var(--ui-card-padding, 1.25rem);
			--_fg: var(--ui-card-fg, var(--fg, currentColor));
			--_header-border: var(--ui-card-header-border, var(--border, rgba(255, 255, 255, 0.06)));
		}

		.card {
			background: var(--_bg);
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			box-shadow: var(--_shadow);
			overflow: hidden;
			color: var(--_fg);
			transition:
				transform 0.25s ease,
				box-shadow 0.25s ease;
		}

		:host([hoverable]) .card:hover {
			transform: translateY(-3px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		}

		.card-image {
			width: 100%;
			height: auto;
			display: block;
			aspect-ratio: 16 / 9;
			object-fit: cover;
		}

		.card-header {
			padding: var(--_padding);
			border-bottom: 1px solid var(--_header-border);
		}

		.card-title {
			font-size: 1.05rem;
			font-weight: 700;
			margin: 0;
			line-height: 1.3;
		}

		.card-subtitle {
			font-size: 0.82rem;
			color: var(--fg-dim, rgba(255, 255, 255, 0.5));
			margin-top: 0.25rem;
		}

		.card-body {
			padding: var(--_padding);
			white-space: pre-line;
			word-wrap: break-word;
		}

		.card-footer {
			padding: var(--_padding);
			border-top: 1px solid var(--_header-border);
		}

		::slotted(*) {
			margin: 0;
		}
	`

	render() {
		const hasHeader = this.title || this.subtitle
		return html`
			<div class="card">
				${this.image
					? html`<img
							class="card-image"
							src=${this.image}
							alt=${this.title || ''}
							loading="lazy"
						/>`
					: ''}
				${hasHeader
					? html` <div class="card-header">
							<slot name="header">
								${this.title ? html`<div class="card-title">${this.title}</div>` : ''}
								${this.subtitle ? html`<div class="card-subtitle">${this.subtitle}</div>` : ''}
							</slot>
						</div>`
					: html`<slot name="header"></slot>`}
				<div class="card-body">
					${this.content
						? html`<div class="card-content">${this.content}</div>`
						: html`<slot></slot>`}
				</div>
				<slot name="footer"> </slot>
			</div>
		`
	}
}

if (!customElements.get('ui-card')) {
	customElements.define('ui-card', UICard)
}

export default UICard
