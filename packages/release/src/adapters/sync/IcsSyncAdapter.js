import { BaseSyncAdapter } from './BaseSyncAdapter.js'

/**
 * IcsSyncAdapter generates universal iCalendar (.ics) VEVENT / VTODO output.
 */
export class IcsSyncAdapter extends BaseSyncAdapter {
	/**
	 * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} items
	 * @param {'VTODO' | 'VEVENT'} [kind='VTODO']
	 * @returns {string}
	 */
	static format(items, kind = 'VTODO') {
		const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//nan0web//release//UK']
		items.forEach((item, idx) => {
			lines.push(`BEGIN:${kind}`)
			lines.push(`UID:nan0-${idx + 1}@nan0web`)
			lines.push(`SUMMARY:${String(item.title || '').replace(/\r?\n/g, ' ')}`)
			if (item.date) lines.push(`DTSTART;VALUE=DATE:${String(item.date).replace(/-/g, '')}`)
			lines.push(`END:${kind}`)
		})
		lines.push('END:VCALENDAR')
		return lines.join('\r\n')
	}

	async syncTasks(tasks) {
		return { ok: true, count: tasks.length, output: IcsSyncAdapter.format(tasks, 'VTODO') }
	}

	async syncEvents(events) {
		return { ok: true, count: events.length, output: IcsSyncAdapter.format(events, 'VEVENT') }
	}
}

export default IcsSyncAdapter
