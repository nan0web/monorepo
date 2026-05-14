import { describe, it } from 'node:test'
import assert from 'node:assert'
import EditorModel from './Editor.js'
import DB from '@nan0web/db'

describe('EditorModel core functionality', () => {
	const db = new DB({
		predefined: [],
	})

	it('How to create an editor model?', () => {
		//import EditorModel from '@nan0web/editor/core'
		const model = new EditorModel({ db })
		assert.ok(model instanceof EditorModel)
	})

	it('How to load a document into editor?', async () => {
		//import EditorModel from '@nan0web/editor/core'
		const model = new EditorModel({ db })
		const testDoc = {
			$content: [{ Button: ['Save'], $variant: 'primary' }],
			$lang: 'en',
		}

		await db.saveDocument('test/page', testDoc)
		const loaded = await model.loadDocument('test/page')

		assert.deepStrictEqual(loaded, testDoc)
		assert.deepStrictEqual(model.content, testDoc)
	})

	it('How to switch editor mode?', () => {
		//import EditorModel from '@nan0web/editor/core'
		const model = new EditorModel({ db })
		const initialMode = model.mode

		assert.strictEqual(initialMode, 'preview')

		model.switchMode('visual')
		assert.strictEqual(model.mode, 'visual')

		model.switchMode('code')
		assert.strictEqual(model.mode, 'code')
	})

	it('How to update editor content?', () => {
		//import EditorModel from '@nan0web/editor/core'
		const model = new EditorModel({ db })
		const initialContent = model.content
		const newContent = [{ Input: { placeholder: 'Enter text' } }]

		model.updateContent(newContent)
		assert.deepStrictEqual(model.content, newContent)
	})
})
