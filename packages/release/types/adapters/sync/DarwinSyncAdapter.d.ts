/**
 * DarwinSyncAdapter syncs tasks to Apple Reminders and events to Apple Calendar via JXA.
 */
export class DarwinSyncAdapter extends BaseSyncAdapter {
    /**
     * @param {{ system?: SystemAdapter }} [options={}]
     */
    constructor(options?: {
        system?: SystemAdapter;
    });
    /** @type {SystemAdapter} */
    $system: SystemAdapter;
    /**
     * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} tasks
     */
    syncTasks(tasks: import("../../domain/Task/TaskModel.js").TaskModel[]): Promise<{
        ok: boolean;
        count: number;
    }>;
    /**
     * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} events
     */
    syncEvents(events: import("../../domain/Task/TaskModel.js").TaskModel[]): Promise<{
        ok: boolean;
        count: number;
    }>;
}
export default DarwinSyncAdapter;
import { BaseSyncAdapter } from './BaseSyncAdapter.js';
import { SystemAdapter } from '../SystemAdapter.js';
