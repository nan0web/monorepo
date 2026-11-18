/**
 * SyncWorkspaceApp — command to synchronize workspace state and re-index agents.
 * Syncs workflows from packages to editor mounts via injected $db.
 */
export class SyncWorkspaceApp extends ModelAsApp {
    static alias: string;
    static locale: {
        help: string;
        default: string;
    };
    static UI: {
        syncStarted: string;
        workflowsSynced: string;
        done: string;
    };
    /**
     * @param {Partial<SyncWorkspaceApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<SyncWorkspaceApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui';
