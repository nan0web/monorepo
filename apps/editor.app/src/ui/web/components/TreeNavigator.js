import { LitElement, html, css } from 'lit'

/**
 * TreeNavigator — Document explorer component.
 * Driven by EditorConfig for visualization settings.
 */
export class TreeNavigator extends LitElement {
	static properties = {
		items: { type: Array },
		config: { type: Object },
		activePath: { type: String }
	}

	static styles = css`
		:host {
			display: block;
			padding: 8px;
		}

		.item {
			padding: 6px 12px;
			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 14px;
			transition: background 0.2s;
		}

		.item:hover {
			background: #f0f0f2;
		}

		.item.active {
			background: #e5e5ea;
			font-weight: 500;
		}

		.marker {
			width: 8px;
			height: 8px;
			border-radius: 50%;
		}

		.icon {
			opacity: 0.6;
		}
	`

	render() {
		const showMarkers = this.config?.uiShowStagedMarkers ?? true
		const markerColor = this.config?.uiStagedMarkerColor ?? '#007aff'

		return html`
			<div class="tree">
				${(this.items || []).map(item => html`
					<div 
						class="item ${this.activePath === item.file.path ? 'active' : ''}"
						@click=${() => this._onSelect(item.file.path)}
					>
						<span class="icon">📄</span>
						<span class="label">${item.file.path}</span>
						${showMarkers && item.isStaged ? html`
							<span class="marker" style="background: ${markerColor}"></span>
						` : ''}
					</div>
				`)}
			</div>
		`
	}

	_onSelect(path) {
		this.dispatchEvent(new CustomEvent('select', {
			detail: { path },
			bubbles: true,
			composed: true
		}))
	}
}

customElements.define('tree-navigator', TreeNavigator)
