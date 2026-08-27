import { ModelAsApp } from '@nan0web/ui-cli';
export type TFunction = import('@nan0web/types').TFunction;
/**
 * CLI Application Model for Workspace Indexing.
 */
export declare class IndexWorkspaceApp extends ModelAsApp {
    /** @type {string[]} */ scopes: string[];
    /** @type {number} */ concurrency: number;
    /** @type {boolean} */ silent: boolean;
    /** @type {string[]} */ ignore: string[];
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
        default: undefined[];
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
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<IndexWorkspaceApp> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, any, any>;
    /**
     * @param {object} [deps]
     * @param {any} [deps.MarkdownIndexer]
     * @param {any} [deps.Embedder]
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    indexFull(deps?: {
        MarkdownIndexer?: any;
        Embedder?: any;
    }): AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>;
    /**
     * Shared event handler for indexing progress events
     * @param {any} it - indexing event
     * @param {any} stateOrDeps
     * @returns {Generator<import('@nan0web/ui').Intent, void, unknown>}
     */
    _handleEvent(it: any, stateOrDeps: any): Generator<import('@nan0web/ui').Intent, void, unknown>;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>}
     */
    indexAgents(): AsyncGenerator<import('@nan0web/ui').Intent, void, unknown>;
    _getProjectsToIndex(storeDb: any, workspaceRoot: any): Promise<any[]>;
}
