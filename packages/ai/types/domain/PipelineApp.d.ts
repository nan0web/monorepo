import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * PipelineApp — OLMUI Pipeline runner for executing sequence of steps defined in pipeline.md.
 */
export declare class PipelineApp extends ModelAsApp {
    /** @type {string} */ file: string;
    /** @type {string} */ output: string;
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static file: {
        help: string;
        type: string;
        default: string;
        positional: boolean;
    };
    static output: {
        help: string;
        type: string;
        alias: string;
        default: string;
    };
    /**
     * @param {Partial<PipelineApp> | Record<string, any>} [data] Initial state
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<PipelineApp> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
    /**
     * Parse markdown content into executable steps.
     * @param {string} mdContent
     * @returns {Array<{ id: string, name: string, command: string }>}
     */
    parsePipeline(mdContent: string): Array<{
        id: string;
        name: string;
        command: string;
    }>;
    /**
     * @param {string} command
     * @param {string} root
     * @returns {Promise<{ status: string, output?: string, error?: string }>}
     */
    _executeCommand(command: string, root: string): Promise<{
        status: string;
        output?: string;
        error?: string;
    }>;
}
