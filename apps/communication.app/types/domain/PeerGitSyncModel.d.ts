/**
 * Conflict-free peer branch synchronization model (refs/heads/peers/<soulId>).
 */
export class PeerGitSyncModel extends ModelAsApp {
    static BATCH_MODES: string[];
    static MERGE_POLICIES: string[];
    static repo: {
        help: string;
        default: string;
    };
    static batchMode: {
        help: string;
        default: string;
    };
    static mergePolicy: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<PeerGitSyncModel>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<PeerGitSyncModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Repository base URI */ repo: string;
    /** @type {string} Commit batching mode */ batchMode: string;
    /** @type {string} Document merge policy */ mergePolicy: string;
    /**
     * Records a peer message commit into refs/heads/peers/<soulId> without conflicts.
     * @param {{ soulId: string, messageUri: string }} input
     * @returns {Promise<{ branch: string, messageUri: string }>}
     */
    recordPeerCommit(input: {
        soulId: string;
        messageUri: string;
    }): Promise<{
        branch: string;
        messageUri: string;
    }>;
    /**
     * Returns current peer branches synchronization state.
     * @returns {Promise<{ branches: Record<string, string[]> }>}
     */
    getSyncState(): Promise<{
        branches: Record<string, string[]>;
    }>;
}
import { ModelAsApp } from '@nan0web/ui';
