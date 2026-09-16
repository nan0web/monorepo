/**
 * Register catalog sync inside a Service Worker.
 *
 * @param {ServiceWorkerGlobalScope} sw - The `self` reference from your SW
 * @param {string[]} indexUrls - Array of .index.txt URLs to watch
 * @param {{ interval?: number }} [options={}]
 */
export function registerCatalogSync(sw: ServiceWorkerGlobalScope, indexUrls: string[], options?: {
    interval?: number;
}): void;
/**
 * Client-side helper: notify Service Worker to check catalogs.
 * Call this from your main application when user returns to the tab.
 *
 * @example
 * import { notifyCatalogCheck } from '@nan0web/catalog-watch/sw'
 *
 * document.addEventListener('visibilitychange', () => {
 *   if (!document.hidden) notifyCatalogCheck()
 * })
 */
export function notifyCatalogCheck(): void;
