import { LitElement, html, css } from 'lit'

/**
 * Table — renders data as a styled HTML table.
 *
 * OLMUI pair: @nan0web/ui-cli Table (ANSI) → ui-lit Table (Web Component)
 *
 * All colors via CSS Custom Properties — override in your theme:
 *   --ui-table-font, --ui-table-header-color, --ui-table-border
 *   --ui-table-fg, --ui-table-fg-muted, --ui-table-hover-bg
 *
 * @element ui-table
 * @prop {Array<Object>} data - Array of row objects
 * @prop {string[]} columns - Column names (auto-detected from data if omitted)
 */
class UITable extends LitElement {
	static properties = {
		data: { type: Array },
		columns: { type: Array },
	}

	constructor() {
		super()
		/** @type {Array<Object>} */
		this.data = []
		/** @type {string[]} */
		this.columns = []
	}

	static styles = css`
		:host {
			display: block;
			--_font: var(--ui-table-font, var(--mono, 'JetBrains Mono', monospace));
			--_header: var(--ui-table-header-color, var(--co, #818cf8));
			--_border: var(--ui-table-border, rgba(255, 255, 255, 0.1));
			--_fg: var(--ui-table-fg, var(--fg, currentColor));
			--_fg-muted: var(--ui-table-fg-muted, var(--fg-muted, rgba(255, 255, 255, 0.6)));
			--_hover: var(--ui-table-hover-bg, rgba(255, 255, 255, 0.03));
		}

		table {
			width: 100%;
			border-collapse: collapse;
			font-family: var(--_font);
			font-size: 0.82rem;
		}

		th {
			text-align: left;
			padding: 0.5rem 0.8rem;
			color: var(--_header);
			border-bottom: 1px solid var(--_border);
			font-weight: 600;
			white-space: nowrap;
		}

		td {
			padding: 0.45rem 0.8rem;
			border-bottom: 1px solid color-mix(in srgb, var(--_border) 40%, transparent);
			color: var(--_fg-muted);
		}

		td:first-child {
			color: var(--_fg);
			font-weight: 500;
		}

		tr {
			transition: background 0.15s;
		}

		tr:hover {
			background: var(--_hover);
		}

		.empty {
			padding: 1rem;
			color: var(--_fg-muted);
			text-align: center;
			font-style: italic;
		}
	`

	/** @returns {string[]} */
	get _cols() {
		if (this.columns && this.columns.length) return this.columns
		if (this.data && this.data.length) return Object.keys(this.data[0])
		return []
	}

	render() {
		if (!this.data || this.data.length === 0) {
			return html`<div class="empty">(empty)</div>`
		}

		const cols = this._cols
		return html`
			<table>
				<thead>
					<tr>
						${cols.map((col) => html`<th>${col}</th>`)}
					</tr>
				</thead>
				<tbody>
					${this.data.map(
						(row) => html`
							<tr>
								${cols.map((col) => html`<td>${row[col] || ''}</td>`)}
							</tr>
						`,
					)}
				</tbody>
			</table>
		`
	}
}

if (!customElements.get('ui-table')) {
	customElements.define('ui-table', UITable)
}

export default UITable
