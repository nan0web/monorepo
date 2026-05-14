/** @typedef {Function} CommandFn */
/**
 * Abstract base class for all apps.
 * Each app processes input commands and produces output.
 */
export default class CoreApp {
    /**
     * Creates a new CoreApp instance.
     * @param {object} props - CoreApp properties
     * @param {string} [props.name="CoreApp"] - App name
     * @param {object} [props.state={}] - Initial state object
     * @param {Message} [props.startCommand=new Message()] - Command line arguments to parse
     */
    constructor(props?: {
        name?: string | undefined;
        state?: object;
        startCommand?: Message | undefined;
    });
    /** @type {string} App name */
    name: string;
    /** @type {Map<string, CommandFn>} Registered command handlers */
    commands: Map<string, CommandFn>;
    /** @type {Record<string, any>} App state */
    state: Record<string, any>;
    /** @type {Message} Starting command parsed from argv */
    startCommand: Message;
    /**
     * Sets app state.
     * @param {string|object} state - State key or object with multiple keys
     * @param {any} [value] - State value if state is a string key
     * @returns {object} Updated state
     */
    set(state: string | object, value?: any): object;
    /**
     * Register a command handler.
     * @param {string} commandName - Name of the command to register
     * @param {Function} handler - async function or sync function that accepts params and returns output
     */
    registerCommand(commandName: string, handler: Function): void;
    /**
     * Returns a string representation of the app.
     * @returns {string} String representation including name and state
     */
    toString(): string;
    /**
     * Process a command message.
     * @param {Message} msg - Command to process
     * @param {UI} ui - UI instance to use for rendering
     * @returns {Promise<any>} Output of the command
     * @throws {Error} If the command is not registered
     */
    processCommand(msg: Message, ui: UI): Promise<any>;
    /**
     * Process an array of command messages sequentially.
     * @param {Message[]} Messages - Array of commands to process
     * @param {UI} ui - UI instance to use for rendering
     * @returns {Promise<any[]>} Array of command outputs
     */
    processCommands(Messages: Message[], ui: UI): Promise<any[]>;
    /**
     * Select a command to run. Must be implemented by subclasses.
     * @param {UI} ui - UI instance for interaction
     * @returns {Promise<string>} Command name to execute
     * @throws {Error} Always thrown as this method must be implemented by subclasses
     */
    selectCommand(ui: UI): Promise<string>;
}
export type CommandFn = Function;
import { Message } from '@nan0web/co';
import UI from './UI.js';
