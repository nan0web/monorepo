export { NaN0WebConfig };
/**
 * Universal App Runner — Phase 2
 *
 * Bootstraps the Data-Driven OS based on nan0web.config.*
 * Uses `async function* run()` pattern for CLI compatibility.
 *
 * Phase 2 additions:
 *   - PagesRouter: pages.yaml → automatic routing
 *   - Renderer: OLMUI universal block renderer
 *   - App Attach: db.extract() → micro-app branches
 */
export class AppRunner extends EventEmitter<[never]> {
    /**
     * @param {string | { cwd?: string, db?: import('@nan0web/db-fs').DBwithFSDriver, dsn?: string, port?: number|string, locale?: string }} [options]
     */
    constructor(options?: string | {
        cwd?: string;
        db?: import("@nan0web/db-fs").DBwithFSDriver;
        dsn?: string;
        port?: number | string;
        locale?: string;
    });
    /** @type {any} */
    db: any;
    /** @type {PagesRouter} */
    router: PagesRouter;
    /** @type {Renderer | null} */
    renderer: Renderer | null;
    /** @type {AppLogger | null} */
    logger: AppLogger | null;
    /** @type {any} */
    options: any;
    cwd: string;
    /** @type {NaN0WebConfig | null} */
    config: NaN0WebConfig | null;
    /** @type {import('@nan0web/db-fs').DBwithFSDriver | null} */
    dataDb: import("@nan0web/db-fs").DBwithFSDriver | null;
    /** @type {object} */
    state: object;
    i18n: I18n;
    /** @type {AppRegistry} */
    registry: AppRegistry;
    /** @type {IntentResolver | null} */
    intents: IntentResolver | null;
    /** @type {Map<string, import('@nan0web/db-fs').DBwithFSDriver>} */
    apps: Map<string, import("@nan0web/db-fs").DBwithFSDriver>;
    /**
     * Main execution generator — yields status messages for CLI rendering.
     * @yields {string}
     */
    run(): AsyncGenerator<string, void, unknown>;
    /**
     * Render a page by URL path.
     * Combines Router + Renderer for full data-bound rendering.
     *
     * @param {string} urlPath - URL path (e.g. '/cases')
     * @returns {Promise<{ page: import('./domain/Page.js').default | null, blocks: object[], breadcrumbs: import('./domain/Page.js').default[] }>}
     */
    renderPage(urlPath: string): Promise<{
        page: import("./domain/Page.js").default | null;
        blocks: object[];
        breadcrumbs: import("./domain/Page.js").default[];
    }>;
    /**
     * Resolve a `<nan0-sandbox>` intent — delegate control to a sub-app.
     *
     * @param {{ src: string, url?: string, ui?: string }} intent
     * @returns {Promise<object[]>} - Array of output messages/blocks from the sub-app
     */
    resolveIntent(intent: {
        src: string;
        url?: string;
        ui?: string;
    }): Promise<object[]>;
    /**
     * Update app state and notify observers.
     * @param {string} key
     * @param {any} value
     */
    updateState(key: string, value: any): void;
    /**
     * Simple start() for non-generator usage.
     * Consumes run() and prints to console.info.
     */
    start(): Promise<void>;
    /**
     * Graceful shutdown — close logger streams and DB connections.
     */
    stop(): void;
    #private;
}
import { NaN0WebConfig } from './domain/index.js';
import { EventEmitter } from 'node:events';
import PagesRouter from './router/PagesRouter.js';
import Renderer from './renderer/Renderer.js';
import AppLogger from './utils/AppLogger.js';
/**
 * Tiny I18n wrapper for AppRunner to support dynamic vocabulary loading.
 */
declare class I18n {
    constructor({ locale }?: {
        locale?: string | undefined;
    });
    locale: string;
    vocabulary: {};
    t: import("../../../packages/types/types/utils/TFunction.js").TFunction;
    /** @param {object} data */
    load(data: object): void;
}
import AppRegistry from './registry/AppRegistry.js';
import IntentResolver from './registry/IntentResolver.js';
