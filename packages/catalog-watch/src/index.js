/**
 * @file index.js — Main export barrel for @nan0web/catalog-watch.
 *
 * Public API:
 * - CatalogWatcher: EventEmitter-based client watcher (Browser / CLI)
 * - CatalogWatcherModel: Agnostic model (for custom adapters)
 * - CatalogIndexModel: Server-side index model + parse/serialize
 *
 * Sub-path exports:
 * - '@nan0web/catalog-watch/server' → buildCatalogIndex (SSG plugin)
 * - '@nan0web/catalog-watch/sw' → registerCatalogSync, notifyCatalogCheck (PWA)
 */

export { CatalogWatcher } from './CatalogWatcher.js'
export { CatalogWatcherModel } from './domain/CatalogWatcherModel.js'
export { CatalogIndexModel } from './domain/CatalogIndexModel.js'
