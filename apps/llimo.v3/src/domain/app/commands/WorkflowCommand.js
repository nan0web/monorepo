import { show, result } from '@nan0web/ui'
import { Command } from './Command.js'

export class WorkflowCommand extends Command {
	static alias = 'workflow'
	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this.chat._
		const UI = /** @type {typeof import('../ChatSessionModel.js').ChatSessionModel} */ (
			this.chat.constructor
		).UI
		const lines = this.content
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)

		/** @type {Array<{role: string, content: string}>} */
		const loadedWorkflows = []

		for (const wfName of lines) {
			yield show(t(UI.loading_workflow, { name: wfName }), 'info')
			const wfContent = await this.chat.loadWorkflow(wfName)
			if (wfContent) {
				loadedWorkflows.push({
					role: 'system',
					content: `## Workflow: ${wfName}\n\n${wfContent}`,
				})
				yield show(t(UI.workflow_loaded, { name: wfName }), 'success')
			} else {
				yield show(t(UI.workflow_not_found, { name: wfName }), 'warn')
			}
		}

		return result(loadedWorkflows)
	}
}
