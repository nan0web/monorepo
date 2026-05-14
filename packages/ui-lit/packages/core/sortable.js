import { LitElement, html, css } from 'lit'

/**
 * Sortable — drag-and-drop reorderable list.
 *
 * OLMUI pair: @nan0web/ui-cli Sortable → ui-react-bootstrap SortableList → ui-lit Sortable
 *
 * Uses native HTML5 Drag and Drop API. Items reorder in-place and emit
 * the updated list on drop.
 *
 * CSS Custom Properties:
 *   --ui-sortable-bg, --ui-sortable-border, --ui-sortable-radius,
 *   --ui-sortable-drag-bg, --ui-sortable-handle
 *
 * @element ui-sortable
 * @prop {Array<string|{id: string, label: string}>} items - List items
 * @fires sortable-change - detail: { items: Array }
 */
class UISortable extends LitElement {
	static properties = {
		items: { type: Array },
		numbered: { type: Boolean },
		_dragIndex: { type: Number, state: true },
		_overIndex: { type: Number, state: true },
	}

	constructor() {
		super()
		this.items = []
		this.numbered = false
		this._dragIndex = -1
		this._overIndex = -1
	}

	static styles = css`
		:host {
			display: block;
			--_bg: var(--ui-sortable-bg, var(--ba-surface, rgba(255, 255, 255, 0.03)));
			--_border: var(--ui-sortable-border, var(--border, rgba(255, 255, 255, 0.08)));
			--_radius: var(--ui-sortable-radius, var(--ra-md, 8px));
			--_drag-bg: var(
				--ui-sortable-drag-bg,
				color-mix(in srgb, var(--co, #818cf8) 12%, transparent)
			);
			--_handle: var(--ui-sortable-handle, var(--fg-dim, rgba(255, 255, 255, 0.3)));
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: 2px;
			border: 1px solid var(--_border);
			border-radius: var(--_radius);
			overflow: hidden;
		}

		.item {
			display: flex;
			align-items: center;
			gap: 0.7rem;
			padding: 0.6rem 1rem;
			background: var(--_bg);
			color: var(--fg, currentColor);
			font-size: 0.9rem;
			cursor: grab;
			transition:
				background 0.15s,
				transform 0.15s;
			user-select: none;
		}

		.item:hover {
			background: rgba(255, 255, 255, 0.05);
		}

		.item.dragging {
			opacity: 0.5;
			transform: scale(0.98);
		}

		.item.over {
			background: var(--_drag-bg);
			border-top: 2px solid var(--co, #818cf8);
		}

		.item:active {
			cursor: grabbing;
		}

		.handle {
			display: flex;
			flex-direction: column;
			gap: 2px;
			flex-shrink: 0;
			color: var(--_handle);
		}

		.handle-line {
			width: 14px;
			height: 2px;
			background: currentColor;
			border-radius: 1px;
		}

		.label {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.number {
			font-size: 0.85rem;
			color: var(--fg-dim, rgba(255, 255, 255, 0.4));
			font-variant-numeric: tabular-nums;
			font-weight: 500;
			min-width: 1.2rem;
		}

		.empty {
			padding: 1.5rem;
			text-align: center;
			color: var(--fg-dim, rgba(255, 255, 255, 0.4));
			font-size: 0.88rem;
			font-style: italic;
		}
	`

	_getLabel(item) {
		return typeof item === 'string' ? item : item.label
	}

	_onDragStart(e, index) {
		this._dragIndex = index
		e.dataTransfer.effectAllowed = 'move'
	}

	_onDragOver(e, index) {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
		this._overIndex = index
	}

	_onDragLeave() {
		this._overIndex = -1
	}

	_onDrop(e, index) {
		e.preventDefault()
		if (this._dragIndex === index || this._dragIndex < 0) return

		const newItems = [...this.items]
		const [moved] = newItems.splice(this._dragIndex, 1)
		newItems.splice(index, 0, moved)
		this.items = newItems
		this._dragIndex = -1
		this._overIndex = -1

		this.dispatchEvent(
			new CustomEvent('sortable-change', {
				bubbles: true,
				composed: true,
				detail: { items: newItems },
			}),
		)
	}

	_onDragEnd() {
		this._dragIndex = -1
		this._overIndex = -1
	}

	render() {
		if (!this.items || this.items.length === 0) {
			return html`<div class="empty">No items</div>`
		}

		return html`
			<div class="list" role="listbox" aria-label="Sortable list">
				${this.items.map(
					(item, i) => html`
						<div
							class="item ${i === this._dragIndex ? 'dragging' : ''} ${i === this._overIndex
								? 'over'
								: ''}"
							draggable="true"
							role="option"
							@dragstart=${(e) => this._onDragStart(e, i)}
							@dragover=${(e) => this._onDragOver(e, i)}
							@dragleave=${this._onDragLeave}
							@drop=${(e) => this._onDrop(e, i)}
							@dragend=${this._onDragEnd}
						>
							<div class="handle" aria-hidden="true">
								<span class="handle-line"></span>
								<span class="handle-line"></span>
								<span class="handle-line"></span>
							</div>
							${this.numbered ? html`<span class="number">${i + 1}.</span>` : ''}
							<span class="label">${this._getLabel(item)}</span>
						</div>
					`,
				)}
			</div>
		`
	}
}

if (!customElements.get('ui-sortable')) {
	customElements.define('ui-sortable', UISortable)
}

export default UISortable
