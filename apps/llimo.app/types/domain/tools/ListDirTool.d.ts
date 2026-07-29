/**
 * ListDirTool — ModelAsApp for listing files and directories.
 *
 * Traverses directories recursively up to the specified depth.
 * Returns { entries } where each entry has { name, path, isDir, isFile }.
 *
 * @example
 * const tool = new ListDirTool({ path: 'src', depth: 2 }, { db })
 * yield* tool.run()
 */
export class ListDirTool extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static path: {
        help: string;
        positional: boolean;
        default: string;
    };
    static depth: {
        help: string;
        type: string;
        default: undefined;
    };
    /**
     * @param {Record<string, any>} [data={}]
     * @param {Record<string, any>} [options={}]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} Directory path */ path: string;
    /** @type {number | undefined} Depth limit */ depth: number | undefined;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
