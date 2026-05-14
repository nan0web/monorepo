import { describe, it } from 'node:test'
import assert from 'node:assert'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import VisualEditor from './VisualEditor.jsx'
import EditorModel from '../core/Editor.js'

describe('React VisualEditor component', () => {
	const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>')
	global.window = dom.window
	global.document = dom.window.document

	const components = {
		Button: ({ children }) => <button>{children}</button>,
		Input: (props) => <input {...props} />,
	}

	it('How to render VisualEditor with empty content?', () => {
		//import VisualEditor from '@nan0web/editor/react'
		const model = new EditorModel({})
		const root = createRoot(document.getElementById('root'))
		root.render(<VisualEditor model={model} components={components} />)

		assert.ok(document.querySelector('.visual-editor'))
	})

	it('How to render VisualEditor with component content?', () => {
		//import VisualEditor from '@nan0web/editor/react'
		const model = new EditorModel({
			initialContent: [{ Button: ['Click me'] }, { Input: { placeholder: 'Type here' } }],
		})

		const root = createRoot(document.getElementById('root'))
		root.render(<VisualEditor model={model} components={components} />)

		assert.ok(document.querySelector('button'))
		assert.ok(document.querySelector('input'))
	})
})
