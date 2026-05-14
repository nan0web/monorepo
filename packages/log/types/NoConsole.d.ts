/**
 * Memory-bound Console implementation that captures logs without output.
 * Part of the `nan0coding.architect` trusted knowledge system.
 */
export default class NoConsole {
    /**
     * Factory method for consistent instance creation.
     * @param {Object} input - Configuration or existing instance
     * @returns {NoConsole}
     */
    static from(input: any): NoConsole;
    /**
     * Creates a silent Console instance that stores logs in memory.
     * @param {Object} [options={}] - Configuration options
     * @param {boolean} [options.silent=false] - Whether to suppress all output
     * @param {any} [options.prefix] - The prefix data for logs (inherited)
     */
    constructor(options?: {
        silent?: boolean | undefined;
        prefix?: any;
    });
    silent: boolean;
    /**
     * Clears all stored logs.
     * @returns {void}
     */
    clear(): void;
    /**
     * Captures debug log without outputting.
     * @param {...*} args - Arguments to capture
     */
    debug(...args: any[]): void;
    /**
     * Captures info log without outputting.
     * @param {...*} args - Arguments to capture
     */
    info(...args: any[]): void;
    /**
     * Captures warning log without outputting.
     * @param {...*} args - Arguments to capture
     */
    warn(...args: any[]): void;
    /**
     * Captures error log without outputting.
     * @param {...*} args - Arguments to capture
     */
    error(...args: any[]): void;
    /**
     * Captures generic log without outputting.
     * @param {...*} args - Arguments to capture
     */
    log(...args: any[]): void;
    /**
     * Captures generic write without outputting.
     * @param {...*} args - Arguments to capture
     */
    write(...args: any[]): void;
    /**
     * Returns captured logs with preserved structure.
     * @param {string | Function | null} type The type to filter
     * @returns {Array<Array<string, any[]>>}
     */
    output(type?: string | Function | null): Array<Array<string, any[]>>;
    /**
     * Ensures optional console methods don't throw.
     */
    assert(): void;
    count(): void;
    countReset(): void;
    dir(): void;
    dirxml(): void;
    group(): void;
    groupCollapsed(): void;
    groupEnd(): void;
    profile(): void;
    profileEnd(): void;
    time(): void;
    timeStamp(): void;
    timeEnd(): void;
    timeLog(): void;
    table(): void;
    trace(): void;
    #private;
}
