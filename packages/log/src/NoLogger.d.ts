import Logger from './Logger.js';
import NoConsole from './NoConsole.js';
export default class NoLogger extends Logger {
    /** @type {NoConsole} */
    console: NoConsole;
    /**
     * Creates a new NoLogger instance.
     * @param {import("./Logger.js").LoggerOptions} [options={}] - The options for the logger
     */
    constructor(options?: import("./Logger.js").LoggerOptions);
    /**
     * Returns the logged output.
     * @returns {Array<Array<any>>} The array of logged messages
     */
    output(): Array<Array<any>>;
}
