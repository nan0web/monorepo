/**
 * RunCommandTool — executes a shell command with a timeout.
 *
 * Captures stdout and stderr, returns exitCode.
 *
 * @example
 * const tool = new RunCommandTool({ command: 'pnpm test', timeout: 5000 })
 * yield* tool.run()
 */
export class RunCommandTool extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static command: {
        help: string;
        positional: boolean;
    };
    static cwd: {
        help: string;
        type: string;
        default: undefined;
    };
    static timeout: {
        help: string;
        type: string;
        default: undefined;
    };
    /**
     * @param {Record<string, any>} [data={}]
     * @param {Record<string, any>} [options={}]
     */
    constructor(data?: Record<string, any>, options?: Record<string, any>);
    /** @type {string} Command */ command: string;
    /** @type {string | undefined} Cwd */ cwd: string | undefined;
    /** @type {number | undefined} Timeout */ timeout: number | undefined;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
