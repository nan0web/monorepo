import { ModelAsApp, show, ask, log, UiForm } from '@nan0web/ui'

/**
 * Action to list contents of the root directory and allow editing.
 */
export class ExplorerAction extends ModelAsApp {
	static UI = { title: 'Explorer' }

	/**
	 * @param {object} options 
	 * @param {import('../EditorModel.js').EditorModel} options.editor
	 */
	async *run(options = {}) {
		const editor = options.editor || this.editor
		const items = await editor.listDirectory('')
		console.log('TEST ITEMS FOUND:', items.length, items.map(i => i.file.path))

		if (items.length === 0) {
			yield show('Каталог порожній.')
			return
		}

		const choices = items.map(entry => ({
			label: `${entry.file.path} (${entry.file.size} bytes)`,
			value: entry.file.path
		}))
		choices.push({ label: 'Cancel', value: '$cancel' })

		const selectedFile = yield ask('Оберіть файл для редагування:', {
			help: 'Оберіть файл для редагування:',
			options: choices
		})

		const path = selectedFile?.value || selectedFile
		if (!path || path === '$cancel') return

		const docData = await editor.loadDocument(path)

		const DynamicModel = class {
			static UI = { title: `Редагування ${path}` }
		}

		for (const [key, value] of Object.entries(docData)) {
			if (key.startsWith('$')) continue // skip metadata
			let type = typeof value
			let finalValue = value
			if (type === 'string') type = 'text'
			if (Array.isArray(value)) {
				type = 'text'
				finalValue = value.join(', ')
			}
			DynamicModel[key] = { help: key, type, defaultValue: finalValue }
		}
		
		console.log('docData keys:', Object.keys(docData))
		console.log('DynamicModel fields:', Object.getOwnPropertyNames(DynamicModel))
		
		const result = yield ask('edit_document', DynamicModel)
		if (result?.cancelled) return
		
		const updatedData = result.value
		
		// Preserve metadata keys like $url
		for (const key of Object.keys(docData)) {
			if (key.startsWith('$')) {
				updatedData[key] = docData[key]
			}
		}

		// Stage the changes
		await editor.stageChange(path, updatedData)
		yield log('success', `Зміни до ${path} збережено в Stage. Використайте 'Commit Stage' для фіксації.`)
	}
}
