import { LitElement, html, css } from 'lit'

/**
 * Tree — hierarchical tree view with collapsible nodes.
 *
 * OLMUI pair: @nan0web/ui-cli Tree → ui-react TreeView → ui-lit Tree
 *
 * CSS Custom Properties:
 *   --ui-tree-fg, --ui-tree-border, --ui-tree-active, --ui-tree-hover,
 *   --ui-tree-indent
 *
 * @element ui-tree
 * @prop {Array<{label: string, children?: Array, expanded?: boolean, active?: boolean, icon?: string}>} items - Tree nodes
 * @fires tree-select - detail: { label: string, path: string[] }
 */
class UITree extends LitElement {
	static properties = {
		items: { type: Array },
		_expanded: { type: Object, state: true },
	}

	constructor() {
		super()
		this.items = []
		this._expanded = new Set()
	}

	updated(changed) {
		if (changed.has('items') && this.items) {
			const newSet = new Set()
			this._collectExpanded(this.items, [], newSet)
			if (newSet.size > 0) this._expanded = newSet
		}
	}

	_collectExpanded(nodes, path, set) {
		;(nodes || []).forEach((node, i) => {
			const key = [...path, i].join('-')
			if (node.expanded) set.add(key)
			if (node.children) this._collectExpanded(node.children, [...path, i], set)
		})
	}

	static styles = css`
		:host {
			display: block;
			--_fg: var(--ui-tree-fg, var(--fg, currentColor));
			--_border: var(--ui-tree-border, var(--border, rgba(255, 255, 255, 0.08)));
			--_active: var(--ui-tree-active, var(--co, #818cf8));
			--_hover: var(--ui-tree-hover, rgba(255, 255, 255, 0.05));
			--_indent: var(--ui-tree-indent, 1.2rem);
			font-size: 0.88rem;
			color: var(--_fg);
		}

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		ul ul {
			margin-left: var(--_indent);
			padding-left: 0.5rem;
			border-left: 1px solid var(--_border);
		}

		li {
			margin: 0;
		}

		.node {
			all: unset;
			box-sizing: border-box;
			width: 100%;
			display: flex;
			align-items: center;
			gap: 0.4rem;
			padding: 0.35em 0.6em;
			border-radius: var(--ra-sm, 4px);
			cursor: pointer;
			transition:
				background 0.15s,
				color 0.15s;
			color: var(--_fg);
		}

		.node:hover {
			background: var(--_hover);
		}

		.node:focus-visible {
			outline: 2px solid var(--_active);
			outline-offset: -2px;
		}

		.node.active {
			color: var(--_active);
			font-weight: 600;
			background: color-mix(in srgb, var(--_active) 10%, transparent);
		}

		.toggle-icon {
			display: inline-flex;
			width: 16px;
			height: 16px;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			transition: transform 0.2s;
		}

		.toggle-icon.expanded {
			transform: rotate(90deg);
		}

		.toggle-icon svg {
			width: 12px;
			height: 12px;
			fill: currentColor;
			opacity: 0.5;
		}

		.toggle-icon.leaf {
			visibility: hidden;
		}

		.node-icon {
			display: inline-flex;
			font-size: 0.9em;
			flex-shrink: 0;
		}

		.node-label {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.children {
			overflow: hidden;
			max-height: 0;
			transition: max-height 0.3s ease;
		}

		.children.open {
			max-height: 2000px;
		}
	`

	_toggleNode(key) {
		const newSet = new Set(this._expanded)
		if (newSet.has(key)) {
			newSet.delete(key)
		} else {
			newSet.add(key)
		}
		this._expanded = newSet
	}

	_selectNode(node, path) {
		this.dispatchEvent(
			new CustomEvent('tree-select', {
				bubbles: true,
				composed: true,
				detail: { label: node.label, path },
			}),
		)
	}

	_renderNodes(nodes, parentPath = []) {
		return html`
			<ul role="group">
				${(nodes || []).map((node, i) => {
					const key = [...parentPath, i].join('-')
					const hasChildren = node.children && node.children.length > 0
					const isExpanded = this._expanded.has(key)
					return html`
						<li role="treeitem" aria-expanded=${hasChildren ? isExpanded : undefined}>
							<button
								class="node ${node.active ? 'active' : ''}"
								@click=${() => {
									if (hasChildren) this._toggleNode(key)
									this._selectNode(node, [...parentPath, i])
								}}
							>
								<span class="toggle-icon ${hasChildren ? (isExpanded ? 'expanded' : '') : 'leaf'}">
									<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
								</span>
								${node.icon ? html`<span class="node-icon">${node.icon}</span>` : ''}
								<span class="node-label">${node.label}</span>
							</button>
							${hasChildren
								? html` <div class="children ${isExpanded ? 'open' : ''}">
										${this._renderNodes(node.children, [...parentPath, i])}
									</div>`
								: ''}
						</li>
					`
				})}
			</ul>
		`
	}

	render() {
		return html` <div role="tree" aria-label="Tree view">${this._renderNodes(this.items)}</div> `
	}
}

if (!customElements.get('ui-tree')) {
	customElements.define('ui-tree', UITree)
}

export default UITree
