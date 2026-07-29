/**
 * SearchCodeTool — ModelAsApp for semantic vector search in the workspace.
 *
 * Uses nan0ai search internally or an injected searcher dependency.
 *
 * @example
 * const tool = new SearchCodeTool({ query: 'Model class' }, { searcher })
 * yield* tool.run()
 */
export class SearchCodeTool extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static query: {
        help: string;
        positional: boolean;
    };
    /**
     * @param {Record<string, any>} [data={}]
     * @param {Record<string, any>} [options={}]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} Query */ query: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
