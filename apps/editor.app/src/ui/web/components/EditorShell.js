import { LitElement, html, css } from 'lit'

/**
 * EditorShell — The main layout container for the web editor.
 * Manages the sidebar and the main content area.
 */
export class EditorShell extends LitElement {
	static properties = {
		model: { type: Object }
	}

	static styles = css`
		:host {
			display: grid;
			grid-template-columns: var(--editor-sidebar-width, 300px) 1fr;
			height: 100vh;
			background: var(--editor-bg, #f5f5f7);
			color: var(--editor-text, #1d1d1f);
			font-family: var(--editor-font, -apple-system, BlinkMacSystemFont, sans-serif);
		}

		aside {
			background: var(--editor-sidebar-bg, #fff);
			border-right: 1px solid var(--editor-border, #d2d2d7);
			overflow-y: auto;
		}

		main {
			padding: 20px;
			overflow-y: auto;
		}

		header {
			padding: 16px;
			border-bottom: 1px solid var(--editor-border, #d2d2d7);
			font-weight: 600;
		}
	`

	render() {
		if (!this.model) return html`<div>Loading Model...</div>`

		return html`
			<aside>
				<header>NaN•Web Editor</header>
				<slot name="sidebar"></slot>
			</aside>
			<main>
				<slot name="main"></slot>
			</main>
		`
	}
}

customElements.define('editor-shell', EditorShell)
