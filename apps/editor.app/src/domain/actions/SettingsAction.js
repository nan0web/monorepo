import { ModelAsApp, log, ask, UiForm } from '@nan0web/ui'
import { EditorConfig } from '../EditorConfig.js'

/**
 * Action to configure the editor properties.
 */
export class SettingsAction extends ModelAsApp {
	static UI = { title: 'Settings (Configuration)' }

	/**
	 * @param {object} options 
	 * @param {import('../EditorModel.js').EditorModel} options.editor
	 */
	async *run(options = {}) {
		const editor = options.editor || this.editor
		
		const fields = []
		for (const [key, schema] of Object.entries(EditorConfig)) {
			if (key === 'UI' || typeof schema !== 'object' || !schema.help) continue
			fields.push({
				name: key,
				label: schema.help || key,
				type: schema.type === 'boolean' ? 'toggle' : (schema.type === 'enum' ? 'select' : 'text'),
				options: schema.options,
				defaultValue: editor.config[key] ?? schema.default
			})
		}

		const form = new UiForm({ title: 'Editor Configuration', fields })
		const result = yield ask(form)
		if (result?.cancelled) return
		
		// Apply changes
		Object.assign(editor.config, result.value)
		yield log('success', 'Configuration updated locally')
	}
}
