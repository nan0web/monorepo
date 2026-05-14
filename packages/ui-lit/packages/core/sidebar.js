import { LitElement, html, css } from 'lit'

/**
 * Sidebar — hierarchical navigation tree.
 *
 * OLMUI pair: @nan0web/ui-react-bootstrap Sidebar → ui-lit Sidebar
 *
 * Does NOT fetch data on its own — receives `items` as a property.
 * Supports nested groups (children array) with collapsible sections.
 *
 * CSS Custom Properties:
 *   --ui-sidebar-width, --ui-sidebar-bg, --ui-sidebar-border,
 *   --ui-sidebar-fg, --ui-sidebar-active, --ui-sidebar-group-fg
 *
 * @element ui-sidebar
 * @prop {string} title - Sidebar header title
 * @prop {Array<{label: string, url: string, active?: boolean, children?: Array}>} items
 */
class UISidebar extends LitElement {
	static properties = {
		title: { type: String },
		items: { type: Array },
	}

	constructor() {
		super()
		this.title = ''
		this.items = []
	}

	static styles = css`
		:host {
			display: block;
			--_width: var(--ui-sidebar-width, 260px);
			--_bg: var(--ui-sidebar-bg, transparent);
			--_border: var(--ui-sidebar-border, var(--border, rgba(255, 255, 255, 0.08)));
			--_fg: var(--ui-sidebar-fg, var(--fg, currentColor));
			--_active: var(--ui-sidebar-active, var(--co, #818cf8));
			--_group-fg: var(--ui-sidebar-group-fg, var(--fg-dim, rgba(255, 255, 255, 0.45)));
		}

		.sidebar {
			width: var(--_width);
			background: var(--_bg);
			border-right: 1px solid var(--_border);
			padding: 0.5rem 0;
			height: 100%;
			overflow-y: auto;
		}

		.sidebar-title {
			padding: 0.8rem 1.2rem;
			font-weight: 700;
			font-size: 1rem;
			color: var(--_fg);
			border-bottom: 1px solid var(--_border);
			margin-bottom: 0.5rem;
		}

		.group-label {
			padding: 1rem 1.2rem 0.4rem;
			font-size: 0.72rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			color: var(--_group-fg);
		}

		.children {
			margin-left: 0.5rem;
			padding-left: 0.8rem;
			border-left: 1px solid var(--_border);
		}

		a {
			display: flex;
			align-items: center;
			padding: 0.45em 1.2rem;
			text-decoration: none;
			color: var(--_fg);
			font-size: 0.88rem;
			font-weight: 500;
			border-radius: var(--ra-sm, 4px);
			margin: 1px 0.5rem;
			transition:
				background 0.15s,
				color 0.15s;
			min-height: 36px;
		}

		a:hover {
			background: color-mix(in srgb, var(--_active) 10%, transparent);
			color: var(--_active);
		}

		a:focus-visible {
			outline: 2px solid var(--_active);
			outline-offset: -2px;
		}

		a[aria-current='page'],
		a.active {
			color: var(--_active);
			font-weight: 700;
			background: color-mix(in srgb, var(--_active) 12%, transparent);
		}

		@media (max-width: 768px) {
			.sidebar {
				width: 100%;
				border-right: none;
				border-bottom: 1px solid var(--_border);
			}
		}
	`

	_renderItem(item) {
		if (item.children && item.children.length > 0) {
			return html`
				<div>
					<div class="group-label">${item.label || item.title}</div>
					<div class="children">${item.children.map((child) => this._renderLeaf(child))}</div>
				</div>
			`
		}
		return this._renderLeaf(item)
	}

	_renderLeaf(item) {
		return html`
			<a
				href=${item.url || '#'}
				class=${item.active ? 'active' : ''}
				aria-current=${item.active ? 'page' : 'false'}
			>
				${item.label || item.title}
			</a>
		`
	}

	render() {
		return html`
			<div class="sidebar" role="navigation" aria-label=${this.title || 'Sidebar'}>
				${this.title ? html`<div class="sidebar-title">${this.title}</div>` : ''}
				${(this.items || []).map((item) => this._renderItem(item))}
			</div>
		`
	}
}

if (!customElements.get('ui-sidebar')) {
	customElements.define('ui-sidebar', UISidebar)
}

export default UISidebar
