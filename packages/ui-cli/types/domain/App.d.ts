/** @typedef {import('@nan0web/ui').Intent} Intent */
/** @typedef {import('@nan0web/ui').ModelAsAppOptions & { appName?: string }} AppOptionsWithName */
/**
 * App — NaN•Web CLI Runner (Model-as-App v2).
 *
 * Encapsulates all execution modes of nan0cli:
 * 1. Remote OLMUI thin client (HTTP/HTTPS target)
 * 2. App-as-a-Model (dynamic module load via ./path or @scope/pkg)
 * 3. Legacy CLI entry (nan0web.cli.entry or exports['./ui/cli'])
 *
 * @extends {ModelAsApp}
 */
export class App extends ModelAsApp {
    static UI: {
        title: string;
        icon: string;
        description: string;
        connecting: string;
        sessionDone: string;
        moduleError: string;
        usageExamples: string[];
        noEntry: string;
        noExport: string;
        noModel: string;
    };
    static target: {
        type: string;
        help: string;
        positional: boolean;
        default: undefined;
    };
    static blueprint: {
        type: string;
        help: string;
        default: boolean;
    };
    static debug: {
        type: string;
        help: string;
        default: boolean;
        alias: string;
    };
    static test: {
        type: string;
        help: string;
        default: boolean;
    };
    static locale: {
        type: string;
        help: string;
        default: undefined;
    };
    static cwd: {
        type: string;
        help: string;
        default: undefined;
    };
    static help: {
        type: string;
        help: string;
        default: boolean;
    };
    static completion: {
        type: string;
        help: string;
        default: undefined;
    };
    static aliases: {
        docs: string;
        app: string;
        config: string;
    };
    /**
     * @param {Partial<App>} [data]
     * @param {Partial<AppOptionsWithName>} [options]
     */
    constructor(data?: Partial<App>, options?: Partial<AppOptionsWithName>);
    /** @type {string | undefined} Target path or URL */ target: string | undefined;
    /** @type {boolean} Enable debug */ debug: boolean;
    /** @type {boolean} CI test mode */ test: boolean;
    /** @type {string | undefined} Locale override */ locale: string | undefined;
    /** @type {string | undefined} Working directory override */ cwd: string | undefined;
    /** @type {boolean} Blueprint mode */ blueprint: boolean;
    /** @type {string | undefined} Completion script type */ completion: string | undefined;
    /** @type {string[]} Remaining positionals for sub-model */ _positionals: string[];
    /**
     * Generate help text with completion instructions.
     * @returns {string} Help text
     */
    generateHelp(): string;
    /**
     * Main execution generator.
     * Routes to the correct execution mode based on parsed args.
     *
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(options?: import("@nan0web/ui").ModelAsAppOptions): AsyncGenerator<any, any, any>;
    /**
     * Run a remote OLMUI server in thin-client mode.
     * @param {string} url
     * @returns {AsyncGenerator<any, any, any>}
     */
    _runRemote(url: string): AsyncGenerator<any, any, any>;
    /**
     * Resolve, import, and run a module by path or package specifier.
     * @param {string} specifier Path or package name
     * @param {string[]} argv Remaining argv for the sub-model
     * @returns {AsyncGenerator<any, any, any>}
     */
    _runModule(specifier: string, argv: string[]): AsyncGenerator<any, any, any>;
    /**
     * Handle shell completion generation.
     * @returns {AsyncGenerator<any, any, any>}
     */
    _handleCompletion(): AsyncGenerator<any, any, any>;
    /**
     * Auto-detect entry from package.json and run it.
     * @returns {AsyncGenerator<any, any, any>}
     */
    _runFromPackage(): AsyncGenerator<any, any, any>;
    /**
     * Instantiate and run an AppModel generator, yielding all intents upstream.
     * @param {typeof ModelAsApp} AppModel
     * @param {string[]} argv Remaining positionals for the sub-model
     * @returns {AsyncGenerator<any, any, any>}
     */
    _runModel(AppModel: typeof ModelAsApp, argv: string[]): AsyncGenerator<any, any, any>;
}
export default App;
export type Intent = import("@nan0web/ui").Intent;
export type AppOptionsWithName = import("@nan0web/ui").ModelAsAppOptions & {
    appName?: string;
};
import { ModelAsApp } from './ModelAsApp.js';
