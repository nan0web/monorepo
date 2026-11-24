/**
 * BaseSyncAdapter defines the OS-agnostic synchronization contract.
 */
export class BaseSyncAdapter {
    /**
     * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} tasks
     * @returns {Promise<{ ok: boolean, count: number, output?: string }>}
     */
    syncTasks(tasks: import("../../domain/Task/TaskModel.js").TaskModel[]): Promise<{
        ok: boolean;
        count: number;
        output?: string;
    }>;
    /**
     * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} events
     * @returns {Promise<{ ok: boolean, count: number, output?: string }>}
     */
    syncEvents(events: import("../../domain/Task/TaskModel.js").TaskModel[]): Promise<{
        ok: boolean;
        count: number;
        output?: string;
    }>;
}
export default BaseSyncAdapter;
