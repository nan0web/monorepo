/**
 * InterfaceTemplate — base class for defining new UI interfaces.
 *
 * Establishes the inheritance pattern for the "One Logic, Many UI" architecture.
 * Each UI interface (CLI, Web, Mobile, Chat, Audio) extends this template
 * and overrides the required methods.
 *
 * @example
 * class CliInterface extends InterfaceTemplate {
 *   render(data) { return formatForTerminal(data) }
 *   async ask(prompt) { return readlinePrompt(prompt) }
 * }
 *
 * @abstract
 */
export default class InterfaceTemplate {
    /**
     * List of methods that MUST be overridden by concrete implementations.
     * Used for documentation and runtime validation.
     *
     * @type {string[]}
     */
    static requiredMethods: string[];
    /**
     * The name of this interface (e.g. 'cli', 'web', 'mobile').
     * Override in subclass.
     *
     * @type {string}
     */
    name: string;
    /**
     * Render data to the user through the interface.
     * Must be overridden by each concrete implementation.
     *
     * @param {any} [data] - data to render
     * @returns {any} rendered output (string for CLI, DOM for web, etc.)
     * @throws {Error} if not overridden
     */
    render(data?: any): any;
    /**
     * Request input from the user through the interface.
     * Must be overridden by each concrete implementation.
     *
     * @param {string} prompt - question or label for the input
     * @param {object} [options] - options (type, choices, default, etc.)
     * @returns {Promise<any>} user's response
     * @throws {Error} if not overridden
     */
    ask(prompt: string, options?: object): Promise<any>;
    /**
     * Validate that all required methods have been overridden.
     * Call this in the subclass constructor to get early feedback.
     *
     * @returns {string[]} list of missing method overrides (empty = valid)
     */
    validate(): string[];
    /**
     * Get interface capabilities info.
     *
     * @returns {{ name: string, requiredMethods: string[], isComplete: boolean }}
     */
    info(): {
        name: string;
        requiredMethods: string[];
        isComplete: boolean;
    };
}
