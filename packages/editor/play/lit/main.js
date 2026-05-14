import { LitElement, html, css } from 'lit'
import EditorModel from '../../src/core/Editor.js'

class EditorPlayground extends LitElement {
	static properties = {
		model: { type: Object },
		content: { type: Array },
		mode: { type: String },
	}

	static styles = css`
		:host {
			display: block;
			font-family: sans-serif;
			max-width: 800px;
			margin: 0 auto;
		}
		.toolbar {
			margin-bottom: 1rem;
			padding-bottom: 1rem;
			border-bottom: 1px solid #ddd;
		}
		button {
			padding: 0.5rem 1rem;
			cursor: pointer;
			margin-right: 0.5rem;
		}
		button.active {
			background: #eee;
			border-color: #333;
		}
		pre {
			background: #f4f4f4;
			padding: 1rem;
			border-radius: 4px;
		}
		.block {
			padding: 1rem;
			border: 1px solid #ccc;
			margin-bottom: 0.5rem;
			border-radius: 4px;
		}
		.block input {
			width: 100%;
			padding: 0.5rem;
			box-sizing: border-box;
		}
		.controls {
			margin-bottom: 1rem;
		}
	`

	constructor() {
		super()
		const mockDb = {
			loadDocument: async () => [
				{ text: { content: 'Lit Web UI Playground' } },
				{ text: { content: 'A simple Lit wrapper around EditorModel' } },
			],
			saveDocument: async () => true,
		}

		this.model = new EditorModel({ db: mockDb, uri: 'demo.json' })
		this.content = []
		this.mode = 'preview'
	}

	async connectedCallback() {
		super.connectedCallback()

		this._unsubscribe = this.model.onChange((state) => {
			this.content = state.content || []
			this.mode = state.mode
		})

		await this.model.loadDocument()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		if (this._unsubscribe) this._unsubscribe()
	}

	_updateBlock(index, text) {
		const newContent = [...this.content]
		newContent[index] = { text: { content: text } }
		this.model.updateContent(newContent)
	}

	_deleteBlock(index) {
		const newContent = [...this.content]
		newContent.splice(index, 1)
		this.model.updateContent(newContent)
	}

	_addBlock() {
		this.model.updateContent([...this.content, { text: { content: 'New block' } }])
	}

	render() {
		if (!this.content || this.content.length === 0) {
			return html`<div>Loading editor...</div>`
		}

		return html`
			<h1>Editor Playground (Lit Core)</h1>

			<div class="toolbar editor-toolbar">
				<button
					class=${this.mode === 'code' ? 'active' : ''}
					@click=${() => this.model.switchMode('code')}
				>
					Code View
				</button>
				<button
					class=${this.mode === 'visual' ? 'active' : ''}
					@click=${() => this.model.switchMode('visual')}
				>
					Visual Editor
				</button>
			</div>

			${this.mode === 'visual'
				? html`
						<div class="controls component-palette">
							<button @click=${this._addBlock}>+ text</button>
						</div>
						<div class="blocks visual-editor">
							${this.content.map(
								(block, i) => html`
									<div class="block editor-block">
										<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
											<span>Text Block</span>
											<button @click=${() => this._deleteBlock(i)}>×</button>
										</div>
										<input
											type="text"
											.value=${block.text?.content || ''}
											@input=${(e) => this._updateBlock(i, e.target.value)}
										/>
									</div>
								`,
							)}
						</div>
					`
				: html`
						<div class="code-view">
							<p>Raw JSON state (simulating Monaco):</p>
						</div>
					`}

			<hr />
			<h3>Preview Document</h3>
			<div class="editor-preview">
				<pre>${JSON.stringify(this.content, null, 2)}</pre>
			</div>
		`
	}
}

customElements.define('editor-playground', EditorPlayground)
