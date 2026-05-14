import { ModelAsApp } from '@nan0web/ui'

/**
 * Action to terminate the editor loop.
 */
export class ExitAction extends ModelAsApp {
	static UI = { title: 'Exit' }

	/**
	 * Returns a specific status to break the Editor's main loop.
	 */
	async *run() {
		return { status: 'exit' }
	}
}
