/**
 * @file PagesRouter — automatic routing from pages.yaml.
 *
 * Loads `pages.yaml` (or `pages` key from Global State) and builds
 * a navigation tree of Page models. Resolves URLs to pages.
 *
 * Architecture:
 *   pages.yaml → PagesRouter.load(state) → Page[] tree
 *   URL slug   → PagesRouter.resolve('/deposits') → Page { layout: 'list', source: 'deposits' }
 *   Pages      → PagesRouter.navigation() → Navigation-ready tree (for ui-core/Navigation)
 */
export default class PagesRouter {
    /** @type {Page[]} */
    pages: Page[];
    /**
     * Load pages from Global State.
     *
     * Expects state.pages to be an array of page descriptors:
     *   - { slug: 'home', title: 'Home', layout: 'page' }
     *   - { slug: 'cases', title: 'Court Cases', layout: 'list', source: 'court.cases' }
     *
     * @param {object} state - Global State built by AppRunner.
     * @returns {PagesRouter}
     */
    load(state: object): PagesRouter;
    /**
     * Hot-reload pages from a new state.
     * @param {object} newState
     * @returns {PagesRouter}
     */
    reload(newState: object): PagesRouter;
    /**
     * Resolve a URL path to a Page.
     * Supports nested paths like '/admin/users'.
     *
     * @param {string} path - URL path (e.g. '/cases', '/admin/users').
     * @returns {Page | null}
     */
    resolve(path: string): Page | null;
    /**
     * Get the active page and its breadcrumb chain.
     *
     * @param {string} path
     * @returns {{ page: Page | null, breadcrumbs: Page[] }}
     */
    match(path: string): {
        page: Page | null;
        breadcrumbs: Page[];
    };
    /**
     * Export navigation-ready structure (for ui-core/Navigation).
     * Filters out hidden pages.
     *
     * @returns {Array<{ href: string, title: string, icon: string, children: any[] }>}
     */
    navigation(): Array<{
        href: string;
        title: string;
        icon: string;
        children: any[];
    }>;
    /**
     * Total number of registered routes (flat).
     * @returns {number}
     */
    get size(): number;
    /**
     * Returns flat list of all registered paths. Useful for Static Export (SSG).
     * @returns {string[]}
     */
    paths(): string[];
    #private;
}
import Page from '../domain/Page.js';
