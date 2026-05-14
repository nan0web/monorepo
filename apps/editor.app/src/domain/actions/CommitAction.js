import { ModelAsApp, log } from '@nan0web/ui'

/**
 * Action to commit local stage changes.
 */
export class CommitAction extends ModelAsApp {
	static UI = { title: 'Commit Stage' }

	/**
	 * @param {object} options 
	 * @param {import('../EditorModel.js').EditorModel} options.editor
	 */
	async *run(options = {}) {
		const editor = options.editor || this.editor
		try {
			const res = await editor.commitChanges('Manual commit')
			yield log('success', res.message)
		} catch (e) {
			yield log('error', e.message)
		}
	}
}
