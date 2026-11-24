/**
 * WindowsAdapter stub for win32 (Windows To Do).
 */
export class WindowsAdapter extends BaseSyncAdapter {
    static UI: {
        notConfiguredTasks: string;
        notConfiguredEvents: string;
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
export default WindowsAdapter;
import { BaseSyncAdapter } from './BaseSyncAdapter.js';
