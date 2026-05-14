import { LitElement, html } from 'lit'
import './components/EditorShell.js'
import './components/TreeNavigator.js'

/**
 * EditorWeb — The main adapter connecting EditorModel to the Lit-based UI.
 * Follows the OLMUI pattern: Logic (Model) -> Binding (Adapter) -> UI (Components).
 */
export class EditorWeb extends LitElement {
	static properties = {
		model: { type: Object },
		_files: { type: Array, state: true }
	}

	constructor() {
		super()
		this._files = []
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.model) {
			this.model.on('active-doc-change', () => this.requestUpdate())
			await this._refreshFiles()
		}
	}

	async _refreshFiles() {
		this._files = await this.model.listDirectory()
	}

	async _onFileSelect(e) {
		const path = e.detail.path
		await this.model.openDocument(path)
	}

	render() {
		if (!this.model) return html`<div>No model connected</div>`

		return html`
			<editor-shell .model=${this.model}>
				<tree-navigator 
					slot="sidebar"
					.items=${this._files}
					.config=${this.model.config}
					.activePath=${this.model.document?.$url}
					@path-select=${(e) => this.run('openDocument', e.detail.path)}
				></tree-navigator>
				
				<div class="main">
					${this.model.document ? html`
						<h2>Editing: ${this.model.document.$url || 'New Document'}</h2>
						<pre>${JSON.stringify(this.model.document, null, 2)}</pre>
					` : html`
						<p>Select a document to edit</p>
					`}
				</div>
			</editor-shell>
		`
	}
}

customElements.define('editor-web', EditorWeb)
