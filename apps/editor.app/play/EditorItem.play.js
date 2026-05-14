import { html, render } from 'lit'
import '../src/EditorItem.js'
import { EditorModel } from '@nan0web/editor'

import { AppModel } from '../src/domain/AppModel.js'

/**
 * Isolated Playground for EditorItem
 */
const container = document.getElementById('playground')

import DBBrowser from '@nan0web/db-browser'
import DB from '@nan0web/db'

// Use actual db-browser adapter per platform rules.
const db = new DB()
db.setAdapter(new DBBrowser({ host: window.location.origin, root: 'data' }))

const model = new EditorModel({
	db,
	uri: 'sandbox-item.json',
	initialContent: { title: 'Loading...' },
	mode: 'visual',
})

// Automatically generate schema from AppModel
model.schema = Object.entries(AppModel).reduce((acc, [key, val]) => {
	acc[key] = {
		type: val.type || 'string',
		help: val.help,
		placeholder: val.placeholder || '',
	}
	return acc
}, {})

const updateState = (action) => {
	const el = document.getElementById('sandbox-status')
	if (el) el.innerHTML = `Status: <b>${action}</b>`
}

const template = html`
	<div
		style="height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg, #222); color: var(--text, #fff);"
	>
		<div
			id="sandbox-status"
			style="position: absolute; top: 1rem; padding: 1rem; background: var(--panel, #000); border: 1px solid var(--co-border, #444); border-radius: 8px;"
		>
			Status: <b>App Ready</b>
		</div>
		<div
			style="width: 100%; max-width: 580px; height: 75vh; border: 1px solid var(--co-border, #444); overflow: hidden; position: relative; background: var(--ba-surface, white);"
		>
			<nan0-editor-item
				.model="${model}"
				.stack="${{
					push: (m) => updateState('Stack Push: ' + m),
					pop: () => updateState('Stack Pop'),
				}}"
			></nan0-editor-item>
		</div>
	</div>
`

render(template, container)
