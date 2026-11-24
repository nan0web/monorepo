/**
 * @typedef {object} ExportCommandOptions
 * @property {string} [config=''] - Hierarchical config URI for db.fetch()
 * @property {string} [path=''] - Path to Markdown file to export
 * @property {string} [target=''] - Batch target mode (e.g. 'all')
 * @property {boolean} [dryRun=false] - Simulate export without writing files
 * @property {string} [output=''] - Optional output base directory override
 */
/**
 * ExportCommand — Universal Semantic Exporter Pipeline (v3.8.0).
 * Routes Markdown files into configured streams via @nan0web/markdown AST and TagLinter.
 */
export class ExportCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        missingConfig: string;
        configNotFound: string;
        missingInput: string;
        noFilesFound: string;
        validating: string;
        exporting: string;
        exportedItem: string;
        isolatedItem: string;
        done: string;
    };
    static config: {
        default: string;
        help: string;
    };
    static path: {
        default: string;
        positional: boolean;
        help: string;
    };
    static target: {
        default: string;
        help: string;
    };
    static dryRun: {
        default: boolean;
        help: string;
    };
    static output: {
        default: string;
        help: string;
    };
    /**
     * @param {Partial<ExportCommandOptions>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { translator?: import('../services/SemanticStreamRouter.js').TranslatorPort }} [options]
     */
    constructor(data?: Partial<ExportCommandOptions>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions> & {
        translator?: import("../services/SemanticStreamRouter.js").TranslatorPort;
    });
    /** @type {string} Hierarchical config URI */
    config: string;
    /** @type {string} Path to Markdown file to export */
    path: string;
    /** @type {string} Batch target mode */
    target: string;
    /** @type {boolean} Dry run mode */
    dryRun: boolean;
    /** @type {string} Optional output base directory */
    output: string;
    /** @type {import('../services/SemanticStreamRouter.js').TranslatorPort | null} Injected translator */
    $translator: import("../services/SemanticStreamRouter.js").TranslatorPort | null;
    /**
     * Resolves target Markdown file paths using db.browse().
     * @param {import('@nan0web/db').default} db
     * @param {string} baseDir
     * @returns {Promise<string[]>}
     */
    resolveTargetFiles(db: import("@nan0web/db").default, baseDir: string): Promise<string[]>;
    /**
     * Computes destination document path inside $db using db path utilities.
     * @param {import('@nan0web/db').default} db
     * @param {string} sourceFile
     * @param {string} baseDir
     * @param {import('../services/SemanticStreamRouter.js').RoutedExportItem} item
     * @returns {string}
     */
    resolveExportPath(db: import("@nan0web/db").default, sourceFile: string, baseDir: string, item: import("../services/SemanticStreamRouter.js").RoutedExportItem): string;
    /**
     * Executes the export pipeline.
     * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui/core").Intent, any, any>;
}
export type ExportCommandOptions = {
    /**
     * - Hierarchical config URI for db.fetch()
     */
    config?: string;
    /**
     * - Path to Markdown file to export
     */
    path?: string;
    /**
     * - Batch target mode (e.g. 'all')
     */
    target?: string;
    /**
     * - Simulate export without writing files
     */
    dryRun?: boolean;
    /**
     * - Optional output base directory override
     */
    output?: string;
};
import { ModelAsApp } from '@nan0web/ui-cli';
