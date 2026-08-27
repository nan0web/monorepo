import { Model } from '@nan0web/types';
export declare class SysBuildAgent extends Model {
    static alias: string;
    static dir: {
        type: string;
        help: string;
        default: string;
        positional: boolean;
    };
    static UI: {
        starting: string;
    };
    /**
     * @param {Partial<SysBuildAgent> | Record<string, any>} [data={}] Initial state
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}] Model options
     */
    constructor(data?: Partial<SysBuildAgent> | Record<string, any>, options?: Partial<import('@nan0web/types').ModelOptions>);
    /**
     * Wrapper for child_process.spawn to allow easier mocking in tests.
     * @param {string} command
     * @param {string[]} args
     * @param {import('node:child_process').SpawnOptions} options
     */
    spawn(command: string, args: string[], options: import('node:child_process').SpawnOptions): any;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
