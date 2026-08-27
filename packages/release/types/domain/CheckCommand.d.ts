import { ModelAsApp } from '@nan0web/ui';
export default class CheckCommand extends ModelAsApp {
    static UI: {
        title: string;
        icon: string;
        description: string;
    };
    static name: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
    /**
     * @param {string} absDir
     * @returns {Promise<string[]>}
     */
    _scanLocal(absDir: string): Promise<string[]>;
    /**
     * @param {string} base
     * @param {string} [dir]
     * @returns {Promise<string[]>}
     */
    _scanDirRecursive(base: string, dir?: string): Promise<string[]>;
}
