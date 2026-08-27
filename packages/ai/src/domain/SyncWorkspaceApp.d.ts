import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * SyncWorkspaceApp — command to synchronize workspace state and re-index agents.
 * Syncs workflows from packages to global AI assistant storage.
 */
export declare class SyncWorkspaceApp extends ModelAsApp {
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
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
