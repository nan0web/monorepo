/**
 * ServeCommand - Universal ModelAsApp for data or release catalogs.
 *
 * Generates HTML content from README.md and release templates using $db and Markdown.
 * Pure OLMUI model: does not start HTTP server, does not call node:fs or child_process.
 *
 * Usage:
 *   pnpm exec serve releases/  # Runs via CLI bootstrap
 */
export default class ServeCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        help: string;
        serving: string;
        dirNotFound: string;
    };
    static dir: {
        help: string;
        positional: boolean;
        type: string;
        default: string;
    };
    static port: {
        help: string;
        default: number;
        type: string;
        alias: string;
    };
    static open: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<ServeCommand>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<ServeCommand>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */
    dir: string;
    /** @type {number} */
    port: number;
    /** @type {boolean} */
    open: boolean;
    /**
     * Convert markdown string to HTML using @nan0web/markdown
     * @param {string} mdRaw
     * @returns {string}
     */
    renderMarkdownToHtml(mdRaw: string): string;
    /**
     * Render HTML content for the target directory
     * @returns {Promise<string>}
     */
    renderHtml(): Promise<string>;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
