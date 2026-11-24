import { ModelAsApp, result, show } from '@nan0web/ui'
import { Markdown } from '@nan0web/markdown'
import { TodoCommand } from './TodoCommand.js'
import { SystemAdapter } from '../adapters/SystemAdapter.js'
import { DarwinSyncAdapter } from '../adapters/sync/DarwinSyncAdapter.js'
import { IcsSyncAdapter } from '../adapters/sync/IcsSyncAdapter.js'
import { CalDavAdapter } from '../adapters/sync/CalDavAdapter.js'
import { WindowsAdapter } from '../adapters/sync/WindowsAdapter.js'
import { KindleExportAdapter } from '../adapters/sync/KindleExportAdapter.js'

/**
 * SyncCommand (ModelAsApp)
 * Syncs tasks/events to OS adapters (Apple Reminders/Calendar, ICS, CalDAV, Windows) or Kindle.
 */
export class SyncCommand extends ModelAsApp {
	static alias = 'sync'

	static UI = {
		title: 'OS-Agnostic Task & Kindle Sync Controller',
	}

	static target = { type: 'string', default: 'ics', help: 'Target: reminders, calendar, ics, kindle' }
	static format = { type: 'string', default: 'txt', help: 'Kindle format: txt, epub' }
	static file = { type: 'string', default: 'todo.md', help: 'Source markdown file' }
	static out = { type: 'string', default: '', help: 'Optional output file path inside cwd' }

	/**
	 * @param {Partial<SyncCommand>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.target
		/** @type {string} */ this.format
		/** @type {string} */ this.file
		/** @type {string} */ this.out
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	async *run() {
		const doc = await this.$db.loadDocument(this.file, null).catch(() => null)
		const tasks = doc ? TodoCommand.extractTasks(new Markdown(String(doc)), this.file) : []

		if (this.target === 'kindle') {
			const exported = KindleExportAdapter.export(tasks, /** @type {any} */ (this.format))
			if (this.out) await this.$db.saveDocument(this.out, exported.content)
			yield show(`Exported ${tasks.length} tasks (${exported.format})`, 'success')
			return result({ ok: true, count: tasks.length, ...exported })
		}

		let adapter
		const platform = this.$system.getPlatform()
		if (this.target === 'ics') adapter = new IcsSyncAdapter()
		else if (platform === 'darwin') adapter = new DarwinSyncAdapter({ system: this.$system })
		else if (platform === 'win32') adapter = new WindowsAdapter()
		else adapter = new CalDavAdapter()

		const res = this.target === 'calendar' ? await adapter.syncEvents(tasks) : await adapter.syncTasks(tasks)
		if (this.out && res.output) await this.$db.saveDocument(this.out, res.output)
		yield show(`Synced ${res.count} items via ${this.target}`, res.ok ? 'success' : 'warn')
		return result(res)
	}
}

export default SyncCommand
