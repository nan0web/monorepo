/**
 * IcsSyncAdapter generates universal iCalendar (.ics) VEVENT / VTODO output.
 */
export class IcsSyncAdapter extends BaseSyncAdapter {
    /**
     * @param {import('../../domain/Task/TaskModel.js').TaskModel[]} items
     * @param {'VTODO' | 'VEVENT'} [kind='VTODO']
     * @returns {string}
     */
    static format(items: import("../../domain/Task/TaskModel.js").TaskModel[], kind?: "VTODO" | "VEVENT"): string;
    syncTasks(tasks: any): Promise<{
        ok: boolean;
        count: any;
        output: string;
    }>;
    syncEvents(events: any): Promise<{
        ok: boolean;
        count: any;
        output: string;
    }>;
}
export default IcsSyncAdapter;
import { BaseSyncAdapter } from './BaseSyncAdapter.js';
