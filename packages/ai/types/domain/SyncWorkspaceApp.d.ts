/**
 * SyncWorkspaceApp — command to synchronize workspace state and re-index agents.
 * Syncs workflows from packages to global AI assistant storage.
 */
export class SyncWorkspaceApp extends ModelAsApp {
    static alias: string;
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
import { ModelAsApp } from '@nan0web/ui-cli';
