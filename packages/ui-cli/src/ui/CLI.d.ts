/**
 * CLi – top‑level runner that orchestrates command execution and help generation.
 *
 * @module CLi
 */
import { Message, OutputMessage } from '@nan0web/co';
import Logger from '@nan0web/log';
/**
 * Main CLi class.
 */
export default class CLi {
    /** @type {string[]} */
    argv: string[];
    /** @type {Logger} */
    logger: Logger;
    /** @type {Array<Function>} */
    Messages: Array<Function>;
    _commands: Map<string, any>;
    /**
     * @param {Object} [input={}]
     * @param {string[]} [input.argv] - Command‑line arguments (defaults to `process.argv.slice(2)`).
     * @param {Object} [input.commands] - Map of command names to handlers.
     * @param {Logger} [input.logger] - Optional logger instance.
     * @param {Array<Function>} [input.Messages] - Message classes for root commands.
     */
    constructor(input?: {
        argv?: string[];
        commands?: any;
        logger?: Logger;
        Messages?: Array<Function>;
    });
    /** @returns {Map<string,Function>} The command map. */
    get commands(): Map<string, Function>;
    /**
     * Register message‑based commands derived from classes.
     *
     * @param {any} cmdClasses - Array of Message classes exposing a `run` generator.
     */
    _registerMessageCommands(cmdClasses: any): void;
    /**
     * Execute the CLi workflow.
     *
     * @param {Message} [msg] - Optional pre‑built message.
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg?: Message): AsyncGenerator<OutputMessage>;
    /**
     * Determine the command name from the positional arguments.
     *
     * @returns {string}
     */
    _parseCommandName(): string;
    /**
     * Generate help output for all registered commands.
     *
     * @yields {OutputMessage}
     */
    _help(): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Factory to create a CLi instance from various inputs.
     *
     * @param {CLi|Object} input - Existing CLi instance or configuration object.
     * @returns {CLi}
     * @throws {TypeError} If input is neither a CLi nor an object.
     */
    static from(input: CLi | any): CLi;
}
