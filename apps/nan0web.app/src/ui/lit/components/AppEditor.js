import { LitElement, html, css } from 'lit'

export class AppEditor extends LitElement {
	static properties = {
		url: { type: String },
		debug: { type: Boolean }
	}

	static styles = css`
		:host {
			display: block;
			background: var(--bg-glass, rgba(255, 255, 255, 0.03));
			border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
			padding: 1.5rem;
			border-radius: var(--radius-md, 12px);
			margin: 1.5rem 0;
			font-family: inherit;
		}
		.editor-box {
			background: var(--bg-secondary, #12121a);
			border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
			border-radius: var(--radius-sm, 8px);
			padding: 1.2rem;
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
			padding-bottom: 0.6rem;
			margin-bottom: 1rem;
		}
		.title {
			font-weight: 600;
			color: var(--accent-secondary, #06b6d4);
			font-size: 1rem;
		}
		.debug-badge {
			background: #e11d48;
			color: white;
			font-size: 0.7rem;
			padding: 0.2rem 0.5rem;
			border-radius: 4px;
			font-weight: bold;
			letter-spacing: 0.05em;
		}
		.body {
			font-family: var(--font-mono, 'JetBrains Mono', monospace);
			font-size: 0.85rem;
			color: var(--text-secondary, #a0a0b8);
			line-height: 1.5;
		}
		.action-btn {
			background: transparent;
			border: 1px solid var(--accent-primary, #7c3aed);
			color: var(--accent-primary, #7c3aed);
			padding: 0.5rem 1.2rem;
			border-radius: 20px;
			cursor: pointer;
			font-weight: 600;
			margin-top: 1rem;
			display: inline-block;
			transition: all 0.2s;
			font-size: 0.85rem;
		}
		.action-btn:hover {
			background: var(--accent-primary, #7c3aed);
			color: white;
		}
	`

	render() {
		return html`
			<div class="editor-box">
				<div class="header">
					<span class="title">App.Editor</span>
					${this.debug ? html`<span class="debug-badge">DEBUG MODE</span>` : ''}
				</div>
				<div class="body">
					<div>Target Path: ${this.url || '/'}</div>
					<div>Status: Ready for welding...</div>
				</div>
				<button class="action-btn" @click=${() => console['log'](`Loading Editor: ${this.url}`)}>Launch Editor</button>
			</div>
		`
	}
}

customElements.define('app-editor', AppEditor)
