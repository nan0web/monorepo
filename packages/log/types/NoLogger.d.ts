export default class NoLogger extends Logger {
    /**
     * Creates a new NoLogger instance.
     * @param {import("./Logger.js").LoggerOptions} [options={}] - The options for the logger
     */
    constructor(options?: import("./Logger.js").LoggerOptions);
    /** @type {NoConsole} */
    console: NoConsole;
    /**
     * Returns the logged output.
     * @returns {Array<Array<any>>} The array of logged messages
     */
    output(): Array<Array<any>>;
}
import Logger from './Logger.js';
import NoConsole from './NoConsole.js';
