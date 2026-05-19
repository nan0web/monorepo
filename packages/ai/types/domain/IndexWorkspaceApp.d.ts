/**
 * CLI Application Model for Workspace Indexing.
 */
export class IndexWorkspaceApp extends ModelAsApp {
    static alias: string;
    static UI: {
        done: string;
        info: string;
        noProjects: string;
        projectCached: string;
        projectIndexed: string;
        agentsStart: string;
        scanning: string;
        verifyingCache: string;
        verifyingCacheProject: string;
        generatingVectors: string;
        errorIndexing: string;
        agentsDone: string;
        generatingVectorsProgress: string;
        scanningProgress: string;
        scanningProject: string;
        noFilesForScope: string;
        projectNoFiles: string;
        projectSkippedInfo: string;
        projectIndexedSuccess: string;
        projectError: string;
    };
    static project: {
        help: string;
        type: string;
        alias: string;
        default: any;
    };
    static scope: {
        help: string;
        type: string;
        alias: string;
        options: string[];
    };
    static force: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    static agents: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    static concurrency: {
        help: string;
        type: string;
        alias: string;
        default: number;
    };
    static ignore: {
        help: string;
        type: string;
        alias: string;
        default: any[];
    };
    static sources: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    static skipData: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    static skipSources: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    static skipDocs: {
        help: string;
        type: string;
        alias: string;
        default: boolean;
    };
    /**
     * @param {Partial<IndexWorkspaceApp> | Record<string, any>} [data] Initial state
     * @param {import('@nan0web/types').ModelOptions} [options] Model options
     */
    constructor(data?: Partial<IndexWorkspaceApp> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string|null} Project id */ project: string | null;
    /** @type {string|null} Scope target */ scope: string | null;
    /** @type {boolean} Shortcut for source scope */ sources: boolean;
    /** @type {boolean} Skip data indexing */ skipData: boolean;
    /** @type {boolean} Skip source indexing */ skipSources: boolean;
    /** @type {boolean} Skip docs indexing */ skipDocs: boolean;
    /** @type {boolean} Force re-indexing */ force: boolean;
    /** @type {boolean} Build agents index */ agents: boolean;
    /** @type {string[]} */ scopes: string[];
    /** @type {number} */ concurrency: number;
    /** @type {boolean} */ silent: boolean;
    /** @type {string[]} */ ignore: string[];
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, void, unknown>;
    /**
     * @param {object} [deps]
     * @param {typeof import('./MarkdownIndexer.js').MarkdownIndexer} [deps.MarkdownIndexer]
     * @param {typeof import('./Embedder.js').Embedder} [deps.Embedder]
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    indexFull({ MarkdownIndexer, Embedder }?: {
        MarkdownIndexer?: typeof import("./MarkdownIndexer.js").MarkdownIndexer;
        Embedder?: typeof import("./Embedder.js").Embedder;
    }): AsyncGenerator<import("@nan0web/ui").Intent, void, unknown>;
    /**
     * Shared event handler for indexing progress events
     * @param {any} it - indexing event
     * @param {object} deps
     * @param {TFunction} deps.t
     * @param {IndexState} state
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    _handleEvent(it: any, stateOrDeps: any): AsyncGenerator<import("@nan0web/ui").Intent, void, unknown>;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    indexAgents(): AsyncGenerator<import("@nan0web/ui").Intent, void, unknown>;
    _getProjectsToIndex(storeDb: any, workspaceRoot: any): Promise<{
        name: any;
        dir: any;
    }[]>;
}
export type TFunction = import("@nan0web/types").TFunction;
import { ModelAsApp } from '@nan0web/ui-cli';
