/**
 * CalDavAdapter stub for Linux (CalDAV / khal).
 */
export class CalDavAdapter extends BaseSyncAdapter {
    static UI: {
        notConfigured: string;
    };
    /**
     * @param {{ t?: (tpl: string) => string }} [options={}]
     */
    constructor(options?: {
        t?: (tpl: string) => string;
    });
    t: (tpl: string) => string;
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
export default CalDavAdapter;
import { BaseSyncAdapter } from './BaseSyncAdapter.js';
