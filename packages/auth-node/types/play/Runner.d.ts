/**
 * Executes a sequence of steps against the auth server.
 */
export declare class Runner {
    baseUrl: string;
    delay: number;
    headers: {
        'Content-Type': string;
    };
    token: any;
    silent: boolean;
    db: import("../AuthDB.js").AuthDB | null;
    /** @type {Array<{type: string, label: string, status: number|string, data: any}>} */
    results: Array<{
        type: string;
        label: string;
        status: number | string;
        data: any;
    }>;
    /**
     * @param {object} options
     * @param {string} [options.baseUrl] - Base URL of the server
     * @param {number} [options.delay=1000] - Delay between steps in ms
     * @param {boolean} [options.silent=false] - Suppress render output (for testing)
     * @param {import('../AuthDB.js').default} [options.db] - AuthDB instance for reading verification codes (test mode only)
     */
    constructor(options?: {
        baseUrl?: string;
        delay?: number;
        silent?: boolean;
        db?: import('../AuthDB.js').default;
    });
    sleep(ms: any): Promise<any>;
    run(steps: any): Promise<void>;
    execute(step: any): Promise<void>;
}
