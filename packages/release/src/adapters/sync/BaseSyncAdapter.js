/**
 * BaseSyncAdapter defines the OS-agnostic synchronization contract.
 */
export class BaseSyncAdapter {
	/**
	 * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} tasks
	 * @returns {Promise<{ ok: boolean, count: number, output?: string }>}
	 */
	async syncTasks(tasks) {
		throw new Error(`syncTasks() not implemented in ${this.constructor.name}`)
	}

	/**
	 * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} events
	 * @returns {Promise<{ ok: boolean, count: number, output?: string }>}
	 */
	async syncEvents(events) {
		throw new Error(`syncEvents() not implemented in ${this.constructor.name}`)
	}
}

export default BaseSyncAdapter
