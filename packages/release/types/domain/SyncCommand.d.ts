/**
 * SyncCommand (ModelAsApp)
 * Syncs tasks/events to OS adapters (Apple Reminders/Calendar, ICS, CalDAV, Windows) or Kindle.
 */
export class SyncCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static target: {
        type: string;
        default: string;
        help: string;
    };
    static format: {
        type: string;
        default: string;
        help: string;
    };
    static file: {
        type: string;
        default: string;
        help: string;
    };
    static out: {
        type: string;
        default: string;
        help: string;
    };
    /**
     * @param {Partial<SyncCommand>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options={}]
     */
    constructor(data?: Partial<SyncCommand>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        system?: SystemAdapter;
    });
    /** @type {string} */ target: string;
    /** @type {string} */ format: string;
    /** @type {string} */ file: string;
    /** @type {string} */ out: string;
    /** @type {SystemAdapter} */ $system: SystemAdapter;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default SyncCommand;
import { ModelAsApp } from '@nan0web/ui';
import { SystemAdapter } from '../adapters/SystemAdapter.js';
