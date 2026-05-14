/**
 * @typedef {'npm' | 'pip' | 'crates' | 'go' | 'maven' | 'composer' | 'gem' | 'pub' | 'hex' | 'github'} RegistryId
 */
/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for LLiMo Knowledge Base Indexer.
 *
 * Indexes local projects (CWD) and external packages into
 * searchable datasets (.datasets/) with hash-based invalidation.
 * Multi-language ecosystem support via registry auto-detection.
 *
 * @example
 *   llimo index                         # CWD
 *   llimo index npm:@nan0web/ui-cli     # external
 *   llimo index --cwd ~/src/my-project  # custom CWD
/**
 * @property {string} source Package identifier or path to index (empty = CWD)
 * @property {string} cwd Working directory override
 * @property {RegistryId} registry Package registry (auto-detected from context when omitted)
 */
export class KBIndexModel extends Model {
    /**
     * @typedef {Object} KBIndexerIndexResult
     * @property {number} filesIndexed
     * @property {number} chunksCreated
     *
     * @typedef {Object} KBIndexDeps
     * @property {Object} scanner
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string[]>} scanner.scan Scans the directory for files
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<RegistryId[]>} scanner.detectRegistries Detects possible registries for a directory
     * @property {Object} indexer
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<KBIndexerIndexResult>} indexer.build Builds the index for a directory
     * @property {(db: import('@nan0web/db').DB, reg: string, name: string, dir: string) => Promise<void>} indexer.downloadPackage Downloads a package from a registry
     * @property {Object} hashStore
     * @property {(files: string[]) => string} hashStore.compute Computes a hash of the directory state
     * @property {(db: import('@nan0web/db').DB, dir: string) => Promise<string | null>} hashStore.read Reads the stored hash for a directory
     * @property {(db: import('@nan0web/db').DB, dir: string, hash: string) => Promise<void>} hashStore.write Writes the hash for a directory
     */
    static source: {
        help: string;
        default: string;
        hint: string;
        positional: boolean;
    };
    static cwd: {
        help: string;
        default: string;
        hint: string;
    };
    static registry: {
        help: string;
        default: string;
        hint: string;
        options: string[];
    };
    static UI: {
        detecting_registry: string;
        registry_detected: string;
        registry_ambiguous: string;
        registry_unknown: string;
        downloading_package: string;
        scanning_files: string;
        building_index: string;
        generating_hash: string;
        index_complete: string;
        source_not_found: string;
        download_confirm: string;
        already_fresh: string;
        reindexing_stale: string;
    };
    /** @type {Record<string, RegistryId>} Maps dependency files → registry identifiers */
    static DEPENDENCY_FILES: Record<string, RegistryId>;
    /** @type {Record<RegistryId, string>} Maps registry → base path under ~/.llimo/kb/@/ */
    static REGISTRY_PATHS: Record<RegistryId, string>;
    /** File extension priorities for indexing (high → medium → low) */
    static INDEX_PRIORITIES: {
        high: string[];
        medium: string[];
        low: string[];
    };
    /** Universal ignore patterns */
    static IGNORE_PATTERNS: string[];
    /**
     * Parses source string into { prefix, name } pair.
     * Handles prefixed (`npm:@scope/pkg`) and bare (`@scope/pkg`) formats.
     *
     * @param {string} source
     * @returns {{ prefix: string, name: string }}
     */
    static parseSource(source: string): {
        prefix: string;
        name: string;
    };
    constructor(data?: {}, config?: {});
    /** @type {any} Package identifier or path to index (empty = CWD) */ source: any;
    /** @type {any} Working directory override */ cwd: any;
    /** @type {any} Package registry (auto-detected from context when omitted) */ registry: any;
    /** @type {any} Maps dependency files to registry identifiers */ DEPENDENCY_FILES: any;
    /** @type {any} Maps registry to base path under ~/.llimo/kb/@/ */ REGISTRY_PATHS: any;
    /** @type {any} File extension priorities for indexing */ INDEX_PRIORITIES: any;
    _config: {};
    /** @returns {boolean} True if indexing CWD (no external source) */
    get isLocal(): boolean;
    /** @returns {string} Resolved working directory */
    get workDir(): string;
    /** @returns {Record<string, string>} Environment variables (injected or process) */
    get env(): Record<string, string>;
    /**
     * Main indexing generator — yields OLMUI intents.
     *
     * @param {{ scanner: object, indexer: object, hashStore: object }} deps
     *   - scanner:   { scan(db, dir, priorities, ignore) → Promise<string[]> }
     *   - indexer:    { build(db, files, outputDir) → Promise<{ filesIndexed, chunksCreated }> }
     *   - hashStore: { read(db, dir) → Promise<string|null>, write(db, dir, hash) → Promise<void>, compute(files) → string }
     */
    run(deps: {
        scanner: object;
        indexer: object;
        hashStore: object;
    }): AsyncGenerator<{
        type: string;
        message: string;
        level?: undefined;
        field?: undefined;
        schema?: undefined;
    } | {
        type: string;
        level: string;
        message: string;
        field?: undefined;
        schema?: undefined;
    } | {
        type: string;
        field: string;
        schema: {
            help: string;
            hint: string;
            options: any;
        };
        message?: undefined;
        level?: undefined;
    } | {
        type: string;
        field: string;
        schema: {
            help: string;
            hint: string;
            options?: undefined;
        };
        message?: undefined;
        level?: undefined;
    }, {
        type: string;
        data: any;
        status?: undefined;
        reason?: undefined;
    } | {
        status: string;
        reason: string;
        type?: undefined;
        data?: undefined;
    }, unknown>;
}
export type RegistryId = "npm" | "pip" | "crates" | "go" | "maven" | "composer" | "gem" | "pub" | "hex" | "github";
import { Model } from '@nan0web/types';
