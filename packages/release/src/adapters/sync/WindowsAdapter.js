import { BaseSyncAdapter } from './BaseSyncAdapter.js'

/**
 * WindowsAdapter stub for win32 (Windows To Do).
 */
export class WindowsAdapter extends BaseSyncAdapter {
	static UI = {
		notConfiguredTasks: 'Windows To Do adapter not configured for this environment',
		notConfiguredEvents: 'Windows Calendar adapter not configured for this environment',
	}

	/**
	 * @param {{ t?: (tpl: string) => string }} [options={}]
	 */
	constructor(options = {}) {
		super()
		this.t = options.t || ((s) => s)
	}

	async syncTasks(tasks) {
		return { ok: false, count: tasks.length, output: this.t(WindowsAdapter.UI.notConfiguredTasks) }
	}

	async syncEvents(events) {
		return { ok: false, count: events.length, output: this.t(WindowsAdapter.UI.notConfiguredEvents) }
	}
}

export default WindowsAdapter
