import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { EditorModel } from '../../../../../domain/EditorModel.js'
import { ExplorerAction } from '../../../../../domain/actions/ExplorerAction.js'

describe('Editor v1.0.1 Regression', () => {
	it('ExplorerAction successfully edits a document and stages it without duplicating _staged', async () => {
		// 1. Setup DB with existing data and a staged file
		const db = new DB({
			predefined: [
				['example.yaml', { title: 'Old Title', tags: ['a', 'b'] }],
				['_staged/example.yaml', { title: 'Old Staged Title', tags: ['a', 'b'] }]
			]
		})
		await db.connect()

		const editor = new EditorModel({}, { db })

		// 2. Simulate User Flow: Select Explorer -> Select example.yaml -> Edit Form
		let step = 0
		const events = []
		const data = await runGenerator(editor.run(), {
			ask: async (intent) => {
				import('node:fs').then(fs => fs.appendFileSync('test-debug.txt', JSON.stringify({ field: intent.field, model: intent.model }) + '\n'))
				if (intent.field === 'action' || intent.field === 'Editor actions: ') {
					return { value: ExplorerAction }
				}
				if (intent.field === 'Оберіть файл для редагування:') {
					// User selects the _staged file to test the duplication bug!
					return { value: '_staged/example.yaml' }
				}
				if (intent.model) {
					// Dynamic form
					return { value: { title: 'New Title', tags: 'c, d' } }
				}
				return { value: 'cancel' }
			},
			progress: () => {},
			log: (i) => events.push(i.message)
		})

		// 3. Assertions
		const staged = await db.loadDocument('_staged/example.yaml')
		assert.ok(staged, 'Document should be staged at _staged/example.yaml')
		assert.equal(typeof staged, 'object', 'Document should be saved as an object, not a string')
		assert.equal(staged.title, 'New Title', 'Title should be updated')
		
		// The double staged file should NOT exist
		let doubleStaged = null
		try {
			doubleStaged = await db.loadDocument('_staged/_staged/example.yaml')
		} catch (e) {}
		assert.equal(doubleStaged, null, '_staged/_staged/example.yaml should not be created')
	})
})
