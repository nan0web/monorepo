/**
 * Automatically builds an OLMUI navigation tree by traversing the DB.
 * Used for Living Docs Engine to avoid manual pages.yaml configuration.
 *
 * Supports both standard site format (index.md) and Git format (README.md)
 * via the `directoryIndex` option.
 *
 * Metadata is extracted automatically by DB.fetch() from .md frontmatter:
 *   ---
 *   title: Getting Started
 *   order: 1
 *   icon: 🚀
 *   hidden: false
 *   layout: page
 *   ---
 *
 * @param {import('@nan0web/db-fs').DBwithFSDriver} db
 * @param {string} [rootPath='.']
 * @param {{ directoryIndex?: string, verbose?: boolean }} [options={}]
 * @returns {Promise<Page[]>}
 */
export function buildNavTree(db: import("@nan0web/db-fs").DBwithFSDriver, rootPath?: string, options?: {
    directoryIndex?: string;
    verbose?: boolean;
}): Promise<Page[]>;
export default buildNavTree;
import Page from '../domain/Page.js';
