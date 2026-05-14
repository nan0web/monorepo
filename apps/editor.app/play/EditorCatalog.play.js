import { html, render } from 'lit'
import '../src/EditorCatalog.js'

/**
 * Isolated Playground for EditorCatalog
 */
const container = document.getElementById('playground')

const items = Array.from({ length: 100 }, (_, i) => ({
	name: `Item ${i + 1}`,
	uri: `data/item-${i + 1}.json`,
}))

const state = { lastAction: 'None' }

const updateState = (action) => {
	state.lastAction = action
	renderApp()
}

const renderApp = () => {
	const template = html`
		<div style="height: 100vh; position: relative; background: var(--bg); color: var(--text);">
			<div
				style="padding: 1rem; position: absolute; z-index: 3000; background: var(--panel); border: 1px solid var(--co-border); top: 1rem; left: 50%; transform: translateX(-50%); border-radius: 8px;"
			>
				Status: <b>${state.lastAction}</b>
			</div>
			<nan0-editor-catalog
				.path="test-sandbox/"
				.items="${items}"
				.onSelect="${(uri) => updateState(`Selected: ${uri}`)}"
				@close="${() => updateState('Close requested')}"
			></nan0-editor-catalog>
		</div>
	`
	render(template, container)
}

renderApp()
