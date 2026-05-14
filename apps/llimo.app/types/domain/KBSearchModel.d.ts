/**
 * @typedef {{ file: string, line: number, type: string, content: string, score: number, source: string }} SearchHit
 */
/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for LLiMo Knowledge Base Search.
 *
 * Cascading search engine: CWD → local projects → external packages.
 * Hash-based freshness check before every search.
 * Smart Early Stop when local results are sufficient.
 *
 * @example
 *   llimo search "renderForm options"
 *   llimo search "Model" --in @nan0web/ui-cli
 *   llimo search "Model" --deps --limit 20
 */
/**
 * @property {string} query Search query text
 * @property {string} inPackage Search only in a specific package
 * @property {number} limit Maximum number of results
 * @property {'cwd' | 'local' | 'all'} depth Cascade depth
 * @property {number} threshold Minimum relevance score (0–1)
 * @property {boolean} deps Search all project dependencies
 * @property {boolean} forceAll Force full cascade (ignore Smart Stop)
 * @property {boolean} externalOnly Search only external packages (skip CWD and local)
 * @property {string} cwd Working directory override
 */
export class KBSearchModel extends Model {
    /**
     * @typedef {Object} KBSearchDeps
     * @property {Object} searcher
     * @property {(db: import('@nan0web/db').DB, query: string, dir: string, opts: object) => Promise<SearchHit[]>} searcher.search Searches in a specific directory
     * @property {(db: import('@nan0web/db').DB) => Promise<string[]>} searcher.listLocalProjects Lists other indexed local projects
     * @property {(db: import('@nan0web/db').DB) => Promise<string[]>} searcher.listExternalPackages Lists indexed external packages
     * @property {(db: import('@nan0web/db').DB, hits: SearchHit[], cwd: string) => Promise<Object[]>} searcher.findUnindexedDependencies Finds missing packages in hits
     * @property {(db: import('@nan0web/db').DB, source: string) => Promise<string | null>} searcher.resolvePackageIndex Resolves package identifier to its index directory
     * @property {Object} hashStore
     * @property {(db: import('@nan0web/db').DB, dir: string, currentFiles: string[]) => Promise<boolean>} hashStore.isStale Checks if index is stale
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string | null>} hashStore.read Reads hash
     * @property {(db: import('@nan0web/db').DB, dir: string, hash: string) => Promise<void>} hashStore.write Writes hash
     * @property {Object} indexer
     * @property {(db: import('@nan0web/db').DB, registry: string, name: string, dir: string) => Promise<void>} indexer.downloadPackage Downloads package
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<void>} indexer.reindex Force reindexes a directory
     */
    static query: {
        help: string;
        default: string;
        hint: string;
        positional: boolean;
        validate: (val: string) => true | "query_required";
    };
    static inPackage: {
        alias: string;
        help: string;
        default: string;
        hint: string;
    };
    static limit: {
        help: string;
        default: number;
        hint: string;
        type: string;
    };
    static depth: {
        help: string;
        default: string;
        hint: string;
        options: string[];
    };
    static threshold: {
        help: string;
        default: number;
        hint: string;
        type: string;
    };
    static deps: {
        help: string;
        default: boolean;
        hint: string;
        type: string;
    };
    static forceAll: {
        help: string;
        default: boolean;
        hint: string;
        type: string;
    };
    static externalOnly: {
        help: string;
        default: boolean;
        hint: string;
        type: string;
    };
    static cwd: {
        help: string;
        default: string;
        hint: string;
    };
    static UI: {
        query_required: string;
        checking_hash: string;
        reindexing_stale: string;
        searching_cwd: string;
        searching_local: string;
        searching_external: string;
        smart_stop: string;
        no_results: string;
        search_complete: string;
        download_dependency_confirm: string;
        index_not_found: string;
    };
    /**
     * Smart Early Stop: if CWD yields ≥ limit results with
     * average relevance ≥ this value, skip external packages.
     */
    static SMART_STOP_THRESHOLD: number;
    constructor(data?: {}, config?: {});
    /** @type {any} Search query text */ query: any;
    /** @type {any} Search only in a specific package */ inPackage: any;
    /** @type {number} Maximum number of results */ limit: number;
    /** @type {any} Cascade depth */ depth: any;
    /** @type {number} Minimum relevance score (0–1) */ threshold: number;
    /** @type {boolean} Search all project dependencies */ deps: boolean;
    /** @type {boolean} Force full cascade (ignore Smart Stop) */ forceAll: boolean;
    /** @type {boolean} Search only external packages (skip CWD and local) */ externalOnly: boolean;
    /** @type {any} Working directory override */ cwd: any;
    _config: {};
    /** @returns {string} Resolved working directory */
    get workDir(): string;
    /** @returns {Record<string, string>} Environment variables (injected or process) */
    get env(): Record<string, string>;
    /**
     * Evaluates Smart Early Stop condition.
     *
     * @param {SearchHit[]} hits - Current result set
     * @returns {boolean} True if cascade should stop
     */
    shouldSmartStop(hits: SearchHit[]): boolean;
    /**
     * Merges and deduplicates results, sorted by score descending.
     *
     * @param {SearchHit[][]} layers - Results from each cascade level
     * @returns {SearchHit[]} Top `limit` results
     */
    mergeResults(layers: SearchHit[][]): SearchHit[];
    /**
     * Main search generator — yields OLMUI intents.
     *
     * Intent types emitted:
     * - `progress` — status update for UI
     * - `ask`      — interactive question to user (e.g. download confirmation)
     * - `log`      — info/warning/error message
     * - return     — final `{ type: 'result', payload }` or `{ status: 'failed' }`
     *
     * @param {{ searcher: object, hashStore: object, indexer: object }} deps
     *   - searcher:  { search(query, indexDir, opts) → Promise<SearchHit[]> }
     *   - hashStore: { read(dir) → Promise<string|null>, isStale(dir) → Promise<boolean> }
     *   - indexer:   { reindex(dir) → Promise<void>, downloadPackage(registry, name, dir) → Promise<void> }
     */
    run(deps: {
        searcher: object;
        hashStore: object;
        indexer: object;
    }): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
        field?: undefined;
        schema?: undefined;
    } | {
        type: string;
        message: string;
        level?: undefined;
        field?: undefined;
        schema?: undefined;
    } | {
        type: string;
        field: string;
        schema: {
            help: string;
            hint: string;
        };
        level?: undefined;
        message?: undefined;
    }, {
        status: string;
        reason: string;
        type?: undefined;
        data?: undefined;
    } | {
        type: string;
        data: {
            query: any;
            hits: any;
            total: any;
            sources: any[];
            smartStop?: undefined;
        };
        status?: undefined;
        reason?: undefined;
    } | {
        type: string;
        data: {
            query: any;
            hits: SearchHit[];
            total: any;
            smartStop: boolean;
            sources: string[];
        };
        status?: undefined;
        reason?: undefined;
    }, unknown>;
    #private;
}
export type SearchHit = {
    file: string;
    line: number;
    type: string;
    content: string;
    score: number;
    source: string;
};
import { Model } from '@nan0web/types';
