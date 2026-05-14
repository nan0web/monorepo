import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { EditorModel } from '../domain/EditorModel.js'
import { EditorConfig } from '../domain/EditorConfig.js'
import DB from '@nan0web/db'

describe('UI Adapter Contract (TDD)', () => {
	it('Should yield sequential blocks (navigator, editor, ask)', async () => {
		const db = new DB({ predefined: [['doc-1.nan0', { title: 'Test' }]] })
		await db.connect()
		const model = new EditorModel({}, { db })
		await model.openDocument('doc-1')
		
		const gen = model.run()
		
		// 1. Progress (Initializing)
		await gen.next()
		// 2. Log (Auth Skipped)
		await gen.next()
		// 3. Log (Ready)
		await gen.next()
		
		// 4. Navigator Block (show)
		const nav = await gen.next()
		assert.equal(nav.value.type, 'show')
		assert.equal(nav.value.component, 'tree-navigator')

		// 5. Editor Block (show - activeDoc is set)
		const editor = await gen.next()
		assert.equal(editor.value.type, 'show')
		assert.equal(editor.value.component, 'schema-form')

		// 6. Ask Intent (action)
		const intent = await gen.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.schema.field, 'action')
	})
})
