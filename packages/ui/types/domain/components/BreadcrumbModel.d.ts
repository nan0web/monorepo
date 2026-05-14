/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label  - Human-readable display name (e.g. "Sandbox", "Кнопка")
 * @property {string} path   - URL-safe segment (e.g. "sandbox", "button")
 */
/**
 * @typedef {Object} BreadcrumbData
 * @property {BreadcrumbItem[]} [items]
 * @property {string} [separator]
 */
/**
 * Model-as-Schema for Breadcrumb navigation.
 *
 * Each breadcrumb item has a `label` (display) and a `path` (URL segment).
 * The full path is the join of all segments, mirroring both:
 *   - Web URL:    /sandbox/button/export
 *   - DBFS URI:   sandbox/button/export/index  (relative to db.root)
 *   - Data path:  {db.root}/sandbox/button/export/index.yaml
 *   - CLI nav:    🏖 Sandbox › Button › Export
 *
 * This is the universal "where am I?" model for any OLMUI application.
 *
 * ESC/Back = pop() one item. Empty stack = app exit.
 * Ctrl+C   = always exit (adapter responsibility).
 */
export class BreadcrumbModel extends Model {
    static $id: string;
    static UI: {
        navigated: string;
    };
    static items: {
        help: string;
        type: string;
        default: never[];
    };
    static separator: {
        help: string;
        default: string;
        type: string;
    };
    /**
     * Reconstruct a BreadcrumbModel from a URL path string.
     *
     * @param {string} urlPath - e.g. "/sandbox/button" or "sandbox/button"
     * @param {Record<string,string>} [labelMap={}] - Optional map of path→label for display names.
     * @returns {BreadcrumbModel}
     */
    static fromPath(urlPath: string, labelMap?: Record<string, string>): BreadcrumbModel;
    /**
     * Create a URL-safe slug from any label.
     * Handles Unicode (Cyrillic, etc.) by lowercasing and replacing spaces/special chars.
     *
     * @param {string} label
     * @returns {string}
     */
    static slugify(label: string): string;
    /**
     * @param {BreadcrumbData | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: BreadcrumbData | Record<string, any>, options?: object);
    /** @type {BreadcrumbItem[]} Navigation stack */ items: BreadcrumbItem[];
    /** @type {string} Visual separator between breadcrumb segments */ separator: string;
    /**
     * Push a new level onto the navigation stack.
     *
     * @param {string} label - Display label (e.g. "Button", "Кнопка")
     * @param {string} [path] - URL segment. Auto-slugified from label if omitted.
     * @returns {this}
     */
    push(label: string, path?: string): this;
    /**
     * Pop the last level from the navigation stack.
     *
     * @returns {BreadcrumbItem|undefined} The removed item, or undefined if stack was empty.
     */
    pop(): BreadcrumbItem | undefined;
    /**
     * Whether the user can navigate back (stack has > 0 items after pop).
     *
     * @returns {boolean}
     */
    canGoBack(): boolean;
    /**
     * Navigate to a specific depth by truncating the stack.
     *
     * @param {number} depth - Target depth (0 = root only).
     * @returns {this}
     */
    navigateTo(depth: number): this;
    /**
     * Full URL-style path: `/sandbox/button/export`
     * @returns {string}
     */
    get path(): string;
    /**
     * Just the path segments array: `['sandbox', 'button', 'export']`
     * @returns {string[]}
     */
    get segments(): string[];
    /**
     * Just the display labels: `['Sandbox', 'Button', 'Export']`
     * @returns {string[]}
     */
    get labels(): string[];
    /**
     * Current (last) breadcrumb item.
     * @returns {BreadcrumbItem|undefined}
     */
    get current(): BreadcrumbItem | undefined;
    /**
     * Current navigation depth (0 = no items).
     * @returns {number}
     */
    get depth(): number;
    /**
     * Serialize to URL query param value: `sandbox/button/export`
     * @returns {string}
     */
    toURL(): string;
    /**
     * DBFS document URI — the key you pass to `db.fetch()` or `db.get()`.
     * Relative to `db.root`, without extension (DBFS resolves `.yaml`/`.json` automatically).
     *
     * @example
     * nav.push('sandbox').push('button')
     * nav.toURI()        // → 'sandbox/button/index'
     * db.fetch(nav.toURI()) // ← DBFS resolves to {root}/sandbox/button/index.yaml
     *
     * @param {string} [leaf='index'] - Document name without extension.
     * @returns {string}
     */
    toURI(leaf?: string): string;
    /**
     * Full filesystem path relative to db.root: `sandbox/button/export/index.yaml`
     * This is what DBFS resolves to on disk: `{cwd}/{root}/{toDataPath()}`.
     *
     * @param {string} [filename='index.yaml'] - Leaf filename with extension.
     * @returns {string}
     */
    toDataPath(filename?: string): string;
    /**
     * Yields a show intent with the current breadcrumb path.
     * This is a "display-only" run — it shows the navigation state.
     */
    run(): AsyncGenerator<import("../../core/Intent.js").ShowIntent, {
        type: string;
        data: {
            path: string;
            items: BreadcrumbItem[];
            depth: number;
        };
    }, unknown>;
}
export type BreadcrumbItem = {
    /**
     * - Human-readable display name (e.g. "Sandbox", "Кнопка")
     */
    label: string;
    /**
     * - URL-safe segment (e.g. "sandbox", "button")
     */
    path: string;
};
export type BreadcrumbData = {
    items?: BreadcrumbItem[] | undefined;
    separator?: string | undefined;
};
import { Model } from '@nan0web/types';
