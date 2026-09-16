/**
 * @file buildCatalogIndex — SSG Plugin Adapter.
 *
 * Bridges CatalogIndexModel (agnostic logic) to real Node.js environment:
 * - `node:fs` for directory scanning
 * - `node:crypto` for SHA-256 hashing
 * - `node:fs` for writing the output .index.txt
 *
 * Zero hardcoded UI text — all messages come from CatalogIndexModel.UI.
 *
 * @example
 * import { buildCatalogIndex } from '@nan0web/catalog-watch/server'
 * await buildCatalogIndex({ root: 'data', locale: 'uk', catalog: 'cards', outDir: 'dist' })
 * // → writes dist/@catalog/uk/cards.index.txt
 */
/**
 * @typedef {Object} BuildOptions
 * @property {string} root - Root data directory (e.g. 'data')
 * @property {string} catalog - Catalog name (e.g. 'cards')
 * @property {string} [locale='en'] - Language code
 * @property {string} [outDir='dist'] - Output directory
 * @property {boolean} [silent=false] - Suppress console output
 */
/**
 * Build a catalog index file during SSG.
 *
 * @param {BuildOptions} options
 * @returns {Promise<{ success: boolean, path?: string, version?: number, hash?: string, itemCount?: number }>}
 */
export function buildCatalogIndex(options: BuildOptions): Promise<{
    success: boolean;
    path?: string;
    version?: number;
    hash?: string;
    itemCount?: number;
}>;
export type BuildOptions = {
    /**
     * - Root data directory (e.g. 'data')
     */
    root: string;
    /**
     * - Catalog name (e.g. 'cards')
     */
    catalog: string;
    /**
     * - Language code
     */
    locale?: string;
    /**
     * - Output directory
     */
    outDir?: string;
    /**
     * - Suppress console output
     */
    silent?: boolean;
};
