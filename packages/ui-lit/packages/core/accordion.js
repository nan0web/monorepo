import { LitElement, html, css } from 'lit'

/**
 * Accordion — collapsible content sections.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Accordion → ui-lit Accordion
 *
 * CSS Custom Properties:
 *   --ui-accordion-bg, --ui-accordion-border, --ui-accordion-radius,
 *   --ui-accordion-fg, --ui-accordion-header-hover, --ui-accordion-active
 *
 * @element ui-accordion
 * @prop {Array<{title: string, content: string, open?: boolean}>} items - Sections
 * @attr {boolean} multiple - Allow multiple sections open simultaneously
 */
class UIAccordion extends LitElement {
	static properties = {
		items: { type: Array },
		multiple: { type: Boolean },
		_openSet: { type: Object, state: true },
	}

	constructor() {
		super()
		this.items = []
		this.multiple = false
		this._openSet = new Set()
	}

	updated(changed) {
		if (changed.has('items') && this.items) {
			const openSet = new Set()
			this.items.forEach((item, i) => {
				if (item.open) openSet.add(i)
			})
			if (openSet.size > 0) this._openSet = openSet
		}
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-accordion-bg, var(--ba-surface, rgba(255, 255, 255, 0.03)));
			--_border: var(--ui-accordion-border, var(--border, rgba(255, 255, 255, 0.08)));
			--_radius: var(--ui-accordion-radius, var(--ra-md, 8px));
			--_fg: var(--ui-accordion-fg, var(--fg, currentColor));
			--_header-hover: var(--ui-accordion-header-hover, rgba(255, 255, 255, 0.05));
			--_active: var(--ui-accordion-active, var(--co, #818cf8));
		}

		.accordion {
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			overflow: hidden;
		}

		.section {
			border-bottom: 1px solid var(--_border);
		}

		.section:last-child {
			border-bottom: none;
		}

		.header {
			all: unset;
			box-sizing: border-box;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.9rem 1.2rem;
			cursor: pointer;
			color: var(--_fg);
			font-size: 0.92rem;
			font-weight: 600;
			background: var(--_bg);
			transition: background 0.15s;
		}

		.header:hover {
			background: var(--_header-hover);
		}

		.header:focus-visible {
			outline: 2px solid var(--_active);
			outline-offset: -2px;
		}

		.header[aria-expanded='true'] {
			color: var(--_active);
		}

		.chevron {
			width: 18px;
			height: 18px;
			fill: currentColor;
			transition: transform 0.25s ease;
			flex-shrink: 0;
		}

		.chevron.open {
			transform: rotate(180deg);
		}

		.panel {
			overflow: hidden;
			max-height: 0;
			transition: max-height 0.3s ease;
		}

		.panel.open {
			max-height: 800px;
		}

		.panel-content {
			padding: 0.8rem 1.2rem 1.2rem;
			font-size: 0.9rem;
			line-height: 1.65;
			color: var(--fg-dim, rgba(255, 255, 255, 0.7));
		}
	`

	_toggle(index) {
		const newSet = new Set(this._openSet)
		if (newSet.has(index)) {
			newSet.delete(index)
		} else {
			if (!this.multiple) newSet.clear()
			newSet.add(index)
		}
		this._openSet = newSet
	}

	render() {
		return html`
			<div class="accordion">
				${(this.items || []).map((item, i) => {
					const isOpen = this._openSet.has(i)
					return html`
						<div class="section">
							<button
								class="header"
								@click=${() => this._toggle(i)}
								aria-expanded=${isOpen}
								aria-controls="panel-${i}"
							>
								<span>${item.title}</span>
								<svg class="chevron ${isOpen ? 'open' : ''}" viewBox="0 0 24 24">
									<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
								</svg>
							</button>
							<div class="panel ${isOpen ? 'open' : ''}" id="panel-${i}" role="region">
								<div class="panel-content">${item.content}</div>
							</div>
						</div>
					`
				})}
			</div>
		`
	}
}

if (!customElements.get('ui-accordion')) {
	customElements.define('ui-accordion', UIAccordion)
}

export default UIAccordion
