import { BaseSyncAdapter } from './BaseSyncAdapter.js'

/**
 * CalDavAdapter stub for Linux (CalDAV / khal).
 */
export class CalDavAdapter extends BaseSyncAdapter {
	static UI = {
		notConfigured: 'CalDAV/khal adapter not configured for this environment',
	}

	/**
	 * @param {{ t?: (tpl: string) => string }} [options={}]
	 */
	constructor(options = {}) {
		super()
		this.t = options.t || ((s) => s)
	}

	async syncTasks(tasks) {
		return { ok: false, count: tasks.length, output: this.t(CalDavAdapter.UI.notConfigured) }
	}

	async syncEvents(events) {
		return { ok: false, count: events.length, output: this.t(CalDavAdapter.UI.notConfigured) }
	}
}

export default CalDavAdapter
