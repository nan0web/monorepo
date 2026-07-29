/**
 * EditFileTool — edits a file using boundary protocol.
 *
 * Two modes:
 * 1. Full file: no startLine/lineCount → writes `content` as entire file
 * 2. Snippet: startLine + lineCount → replaces that range using `applyBoundaries()`
 *
 * @example
 * // Full file write
 * new EditFileTool({ path: 'new.js', content: 'hello' }, { db })
 *
 * // Snippet edit (replace 2 lines starting at line 3)
 * new EditFileTool({ path: 'app.js', startLine: 3, lineCount: 2, content: 'X\nY' }, { db })
 */
export class EditFileTool extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static path: {
        help: string;
        positional: boolean;
    };
    static startLine: {
        help: string;
        type: string;
        default: undefined;
    };
    static lineCount: {
        help: string;
        type: string;
        default: undefined;
    };
    static content: {
        help: string;
        default: string;
    };
    /**
     * @param {Record<string, any>} [data={}]
     * @param {Record<string, any>} [options={}]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} File path */ path: string;
    /** @type {number | undefined} Start line */ startLine: number | undefined;
    /** @type {number | undefined} Line count */ lineCount: number | undefined;
    /** @type {string} Content */ content: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
