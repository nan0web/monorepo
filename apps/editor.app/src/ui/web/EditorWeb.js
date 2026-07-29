import { LitElement, html, css } from 'lit'
import './components/EditorShell.js'
import './components/TreeNavigator.js'
import '../../EditorItem.js'
import { EditorModel as DocEditorModel } from '@nan0web/editor'
import { NewsItem } from '/Users/i/src/nan.web/apps/3rdparty/ipne.ws/news-analizer/src/domain/NewsItem.js'
import { AiAssistantIntent } from '/Users/i/src/nan.web/apps/3rdparty/ipne.ws/news-analizer/src/domain/AiAssistantIntent.js'

/**
 * EditorWeb — The main adapter connecting EditorModel to the Lit-based UI.
 * Follows the OLMUI pattern: Logic (Model) -> Binding (Adapter) -> UI (Components).
 */
export class EditorWeb extends LitElement {
	static properties = {
		model: { type: Object },
		_files: { type: Array, state: true },
		_aiProgress: { type: String, state: true }
	}

	static styles = css`
		.main {
			display: block;
			height: 100%;
			overflow: hidden;
			background: #fff;
		}
		.sidebar-content {
			display: flex;
			flex-direction: column;
			height: 100%;
			justify-content: space-between;
			padding: 1rem;
			box-sizing: border-box;
			gap: 1.5rem;
		}
		.ai-assistant-card {
			background: #f8f9fa;
			border: 1px solid #e0e0e0;
			border-radius: 8px;
			padding: 1rem;
			display: flex;
			flex-direction: column;
			gap: 0.6rem;
		}
		.ai-assistant-card h3 {
			margin: 0;
			font-size: 0.85rem;
			font-weight: 600;
			color: #333;
			text-transform: uppercase;
			letter-spacing: 0.05rem;
		}
		.ai-input-group {
			display: flex;
			gap: 0.4rem;
		}
		.ai-input-group input {
			flex: 1;
			padding: 0.4rem 0.6rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			font-size: 0.85rem;
			outline: none;
			background: #fff;
			color: #333;
		}
		.ai-input-group button {
			padding: 0.4rem 0.8rem;
			background: #10b981;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-weight: 600;
			font-size: 0.85rem;
		}
		.ai-input-group button:hover {
			background: #059669;
		}
		.ai-progress-status {
			font-size: 0.75rem;
			color: #059669;
			font-family: monospace;
			animation: pulse 1.5s infinite;
		}
		@keyframes pulse {
			0% { opacity: 0.6; }
			50% { opacity: 1; }
			100% { opacity: 0.6; }
		}
	`

	constructor() {
		super()
		this._files = []
		this._aiProgress = ''
		this._activeEditorWrapper = null
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.model) {
			this.model.on('active-doc-change', () => this._onDocChange())
			this.model.on('document-change', () => this._onDocChange())
			await this._refreshFiles()
		}
	}

	async _refreshFiles() {
		this._files = await this.model.listDirectory()
	}

	_onDocChange() {
		const doc = this.model.document
		if (doc) {
			const db = this.model.stageDb || this.model._.db
			this._activeEditorWrapper = new DocEditorModel({
				db,
				uri: doc.$url || this.model.document?.$url,
				initialContent: doc,
				mode: 'visual'
			})

			// Map schema from the model class metadata
			const ModelClass = doc.constructor
			this._activeEditorWrapper.schema = Object.entries(ModelClass).reduce((acc, [key, val]) => {
				if (typeof val === 'object' && val !== null && val.type) {
					acc[key] = {
						type: val.type || 'string',
						help: val.help,
						placeholder: val.placeholder || '',
					}
				}
				return acc
			}, {})

			// Reactively notify and update
			this._activeEditorWrapper.onChange(async () => {
				doc.setData(this._activeEditorWrapper.content)
				await this._refreshFiles()
				this.requestUpdate()
			})
		} else {
			this._activeEditorWrapper = null
		}
		this.requestUpdate()
	}

	async run(methodName, ...args) {
		const generator = this.model[methodName](...args)
		if (generator && typeof generator[Symbol.asyncIterator] === 'function') {
			for await (const intent of generator) {
				if (intent.type === 'log') {
					console.log(`[Model Log] ${intent.message}`)
				}
			}
		}
		await this._refreshFiles()
		this.requestUpdate()
	}

	_handleAiKeydown(e) {
		if (e.key === 'Enter') {
			e.preventDefault()
			this._runAiAssistant()
		}
	}

	async _runAiAssistant() {
		const queryInput = this.shadowRoot.getElementById('ai-query')
		const query = queryInput ? queryInput.value : ''
		if (!query) return

		const db = this.model.stageDb || this.model._.db
		const intent = new AiAssistantIntent({ query }, { db })

		this._aiProgress = 'Initializing AI Assistant...'
		this.requestUpdate()

		try {
			const generator = intent.run()
			let res = await generator.next()
			while (!res.done) {
				const val = res.value
				if (val && val.type === 'progress') {
					this._aiProgress = val.message
					this.requestUpdate()
				}
				res = await generator.next()
			}

			const finalResult = res.value?.data
			if (finalResult) {
				this._aiProgress = 'Result generated successfully!'
				
				const NewsItemClass = db.models.get('news/') || NewsItem
				const newDoc = new NewsItemClass({
					title: finalResult.title || 'New AI Draft',
					content: finalResult.content || '',
					blocks: finalResult.blocks || [],
					source: 'AI Assistant',
					manual_import: true
				})

				const docId = `news/ai-draft-${Date.now()}.nan0`
				await db.saveDocument(docId, newDoc)

				// Clear input
				if (queryInput) queryInput.value = ''
				this._aiProgress = ''

				await this._refreshFiles()
				await this.run('openDocument', docId)
			}
		} catch (err) {
			this._aiProgress = `Error: ${err.message}`
		}
		this.requestUpdate()
	}

	render() {
		if (!this.model) return html`<div>No model connected</div>`

		return html`
			<editor-shell .model=${this.model}>
				<div slot="sidebar" class="sidebar-content">
					<tree-navigator 
						.items=${this._files}
						.config=${this.model.config}
						.activePath=${this.model.document?.$url}
						@path-select=${(e) => this.run('openDocument', e.detail.path)}
					></tree-navigator>
					
					<div class="ai-assistant-card">
						<h3>✨ AI Agent Assistant</h3>
						<div class="ai-input-group">
							<input id="ai-query" type="text" placeholder="Voice or text query..." @keydown=${this._handleAiKeydown} />
							<button @click=${this._runAiAssistant}>Ask</button>
						</div>
						${this._aiProgress ? html`<div class="ai-progress-status">🤖 ${this._aiProgress}</div>` : ''}
					</div>
				</div>
				
				<div slot="main" class="main">
					${this._activeEditorWrapper ? html`
						<nan0-editor-item 
							.model=${this._activeEditorWrapper}
							.stack=${{
								pop: () => {
									this.model.document = null
									this._activeEditorWrapper = null
									this.requestUpdate()
								}
							}}
						></nan0-editor-item>
					` : html`
						<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #aaa; font-family: sans-serif; gap: 1rem;">
							<div style="font-size: 3rem;">📄</div>
							<p>Select a document from the sidebar to edit, or ask AI Assistant to generate a new draft.</p>
						</div>
					`}
				</div>
			</editor-shell>
		`
	}
}

customElements.define('editor-web', EditorWeb)
