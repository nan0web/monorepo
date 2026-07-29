/**
 * ViewFileTool — reads a file and displays it with line numbers.
 *
 * Supports partial view via startLine/endLine (1-indexed, inclusive).
 * Returns { path, lines } on success, { error: true } on failure.
 *
 * @example
 * const tool = new ViewFileTool({ path: 'src/app.js' }, { db })
 * yield* tool.run() // shows numbered lines, returns { path, lines }
 */
export class ViewFileTool extends ModelAsApp {
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
    static endLine: {
        help: string;
        type: string;
        default: undefined;
    };
    /**
     * @param {Record<string, any>} [data={}]
     * @param {Record<string, any>} [options={}]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} File path */ path: string;
    /** @type {number | undefined} Start line */ startLine: number | undefined;
    /** @type {number | undefined} End line */ endLine: number | undefined;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
