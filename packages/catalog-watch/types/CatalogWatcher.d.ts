/**
 * @file CatalogWatcher — EventEmitter-based client adapter.
 *
 * Bridges CatalogWatcherModel (agnostic logic) to real browser/Node.js environment:
 * - Real `fetch` API
 * - Real `setInterval` / `setTimeout` for polling
 * - @nan0web/event EventBus for emitting: 'updated', 'unchanged', 'error'
 *
 * Zero hardcoded UI text — all messages come from CatalogWatcherModel.UI.
 *
 * @example
 * import { CatalogWatcher } from '@nan0web/catalog-watch'
 *
 * const watcher = new CatalogWatcher({
 *   url: 'https://bank.example.com/@catalog/uk/cards.index.txt',
 *   interval: 3600,
 * })
 * watcher.on('updated', (index) => { console.log('New version:', index.version) })
 * watcher.on('unchanged', () => { console.log('No changes') })
 * watcher.on('error', (err) => { console.error(err) })
 * watcher.start()
 */
export class CatalogWatcher {
    /**
     * @param {Partial<CatalogWatcherModel> & { url: string }} options
     */
    constructor(options: Partial<CatalogWatcherModel> & {
        url: string;
    });
    /**
     * @param {'updated'|'unchanged'|'error'} event
     * @param {Function} fn
     */
    on(event: "updated" | "unchanged" | "error", fn: Function): this;
    /**
     * @param {'updated'|'unchanged'|'error'} event
     * @param {Function} fn
     */
    off(event: "updated" | "unchanged" | "error", fn: Function): this;
    /** Start periodic polling. */
    start(): this;
    /** Stop polling. */
    stop(): this;
    /** Force an immediate check. */
    checkNow(): Promise<void>;
    /** @returns {string} Current watcher status */
    get status(): string;
    /** @returns {string} Last check timestamp */
    get lastCheck(): string;
    /** @returns {string} Last known hash */
    get lastHash(): string;
    /** @returns {string} Watched URL */
    get url(): string;
    /** @returns {number} Polling interval in seconds */
    get interval(): number;
    #private;
}
import { CatalogWatcherModel } from './domain/CatalogWatcherModel.js';
