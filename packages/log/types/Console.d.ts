export default LogConsole;
/**
 * A cross-platform Console class that wraps console methods for both Node.js and browsers.
 * Provides a consistent interface for logging across environments and supports streaming to files.
 */
declare class LogConsole {
    /**
     * Creates a new Console instance.
     * @param {Object} [options={}] - Console configuration options
     * @param {any} [options.prefix] - The prefix data for every log
     * @param {Console} [options.console=console] - The underlying console instance to wrap
     */
    constructor(options?: {
        prefix?: any;
        console?: Console | undefined;
    });
    /** @type {any} */
    prefix: any;
    console: Console;
    /**
     * Applies the prefix to arguments if defined
     * @param {any[]} args - Arguments list
     * @returns {any[]}
     */
    _applyPrefix(args: any[]): any[];
    /**
     * Logs a debug message
     * @param {...any} args - Arguments to log
     */
    debug(...args: any[]): void;
    /**
     * Logs an info message
     * @param {...any} args - Arguments to log
     */
    info(...args: any[]): void;
    /**
     * Logs a warning message
     * @param {...any} args - Arguments to log
     */
    warn(...args: any[]): void;
    /**
     * Logs an error message
     * @param {...any} args - Arguments to log
     */
    error(...args: any[]): void;
    /**
     * Logs a generic message
     * @param {...any} args - Arguments to log
     */
    log(...args: any[]): void;
    /**
     * Clears the console
     */
    clear(): void;
    /**
     * Asserts a condition
     * @param {boolean} condition - Condition to assert
     * @param {...any} args - Arguments to log if assertion fails
     */
    assert(condition: boolean, ...args: any[]): void;
    /**
     * Logs the count of calls to this method with a specific label
     * @param {string} [label='default'] - Label for the counter
     */
    count(label?: string): void;
    /**
     * Resets the counter for a specific label
     * @param {string} [label='default'] - Label for the counter to reset
     */
    countReset(label?: string): void;
    /**
     * Displays an interactive listing of object properties
     * @param {object} obj - Object to display
     */
    dir(obj: object): void;
    /**
     * Displays an interactive tree of descendant elements
     * @param {object} obj - Object to display
     */
    dirxml(obj: object): void;
    /**
     * Creates an inline group in the console
     * @param {...any} args - Arguments for group creation
     */
    group(...args: any[]): void;
    /**
     * Creates a collapsed inline group in the console
     * @param {...any} args - Arguments for group creation
     */
    groupCollapsed(...args: any[]): void;
    /**
     * Exits the current inline group
     */
    groupEnd(): void;
    /**
     * Starts a profile with the specified label
     * @param {string} label - Label for the profile
     */
    profile(label: string): void;
    /**
     * Ends a profile with the specified label
     * @param {string} label - Label for the profile
     */
    profileEnd(label: string): void;
    /**
     * Starts a timer with the specified label
     * @param {string} [label='default'] - Label for the timer
     */
    time(label?: string): void;
    /**
     * Logs a timestamp with the specified label
     * @param {string} label - Label for the timestamp
     */
    timeStamp(label: string): void;
    /**
     * Stops a timer and logs the elapsed time
     * @param {string} [label='default'] - Label for the timer
     */
    timeEnd(label?: string): void;
    /**
     * Logs the current value of a timer
     * @param {string} [label='default'] - Label for the timer
     */
    timeLog(label?: string): void;
    /**
     * Displays tabular data
     * @param {any} data - Data to display
     * @param {string[]} [columns] - Columns to display
     */
    table(data: any, columns?: string[]): void;
    /**
     * Logs a stack trace
     */
    trace(): void;
}
