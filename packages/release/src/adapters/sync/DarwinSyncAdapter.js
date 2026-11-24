import { BaseSyncAdapter } from './BaseSyncAdapter.js'
import { SystemAdapter } from '../SystemAdapter.js'

/**
 * DarwinSyncAdapter syncs tasks to Apple Reminders and events to Apple Calendar via JXA.
 */
export class DarwinSyncAdapter extends BaseSyncAdapter {
	/**
	 * @param {{ system?: SystemAdapter }} [options={}]
	 */
	constructor(options = {}) {
		super()
		/** @type {SystemAdapter} */
		this.$system = options.system || new SystemAdapter()
	}

	/**
	 * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} tasks
	 */
	async syncTasks(tasks) {
		const titles = JSON.stringify(tasks.map((t) => t.title))
		const script = `const app = Application("Reminders"); const list = app.defaultList(); ${titles}.forEach(name => { list.reminders.push(app.Reminder({ name })); });`
		await this.$system.runJxa(script)
		return { ok: true, count: tasks.length }
	}

	/**
	 * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} events
	 */
	async syncEvents(events) {
		const items = JSON.stringify(events.map((e) => ({ summary: e.title, date: e.date })))
		const script = `const app = Application("Calendar"); const cal = app.calendars[0]; ${items}.forEach(ev => { const d = new Date(ev.date || Date.now()); cal.events.push(app.Event({ summary: ev.summary, startDate: d, endDate: d })); });`
		await this.$system.runJxa(script)
		return { ok: true, count: events.length }
	}
}

export default DarwinSyncAdapter
