/**
 * Generates a UIForm from a static Body schema.
 *
 * @param {Function} BodyClass - Class defining field schema.
 * @param {Object} [options={}] - Generation options.
 * @param {Object} [options.initialState={}] - Pre-filled form values.
 * @param {Function} [options.t] - Optional translation function.
 * @returns {UIForm} Form instance ready for input.
 */
export function generateForm(BodyClass: Function, options?: {
    initialState?: any;
    t?: Function | undefined;
}): UIForm;
/**
 * Unified UI Adapter that handles both input and output operations.
 * It manages user interactions and rendering of messages, forms, and progress.
 *
 * @class UiAdapter
 * @extends EventProcessor
 *
 * @example
 * const adapter = new UiAdapter()
 * adapter.output = new View()
 *
 * const result = await adapter.requireInput(new LoginMessage())
 * console.log(result) // { username: "user", password: "pass" }
 */
export default class UiAdapter extends EventProcessor {
    static CancelError: typeof CancelError;
    /** @returns {typeof CancelError} */
    get CancelError(): typeof CancelError;
    /** @type {OutputAdapter | null} Output interface for rendering */
    output: OutputAdapter | null;
    /**
     * Starts listening for input and emits an `input` event.
     *
     * @returns {void}
     */
    start(): void;
    /**
     * Stops listening for input and output streams.
     * Default implementation does nothing; override in subclasses to perform cleanup.
     *
     * @returns {void}
     */
    stop(): void;
    /**
     * Checks whether the adapter is ready to receive input.
     *
     * @returns {boolean} Always true in base class; override for specific checks.
     */
    isReady(): boolean;
    /**
     * Helper to ask a question.
     * Must be implemented by subclasses.
     *
     * @param {string} question - Question to ask the user.
     * @returns {Promise<string>} User's response.
     * @throws {Error} If not implemented in subclass.
     */
    ask(question: string): Promise<string>;
    /**
     * Generic selection prompt.
     * Must be implemented by subclasses.
     *
     * @param {object} config - Selection configuration.
     * @param {string[]} [config.options=[]] - List of options to choose from.
     * @returns {Promise<{ index: number, value: string | null }>} Selected option.
     * @throws {Error} If not implemented in subclass.
     */
    select(config: {
        options?: string[] | undefined;
    }): Promise<{
        index: number;
        value: string | null;
    }>;
    /**
     * Process a UIForm and return its result.
     *
     * This default implementation follows an **agnostic UI** approach:
     * it simply returns the form instance (with optional initial state merged)
     * without UI interaction. Concrete adapters (CLI, Web, etc.) can override
     * this method to render the form, collect user input and return a richer
     * result object (`{ form, cancelled }`).
     *
     * @param {UIForm} form - The UIForm instance to process.
     * @param {object} [initialState={}] - Pre‑filled values for the form.
     * @returns {Promise<{ form: UIForm, cancelled?: boolean }>} Form processing result.
     */
    processForm(form: UIForm, initialState?: object): Promise<{
        form: UIForm;
        cancelled?: boolean;
    }>;
    /**
     * Ensures a message's body is fully and validly filled.
     * Generates a form from the message's static Body schema,
     * then iteratively collects input until all fields are valid or cancelled.
     *
     * @template {UIMessage} T
     * @param {T} msg - Message instance needing input.
     * @returns {Promise<T['body']>} Updated and validated message body.
     *
     * @example
     * const body = await adapter.requireInput(new LoginMessage({ body: { username: "user" } }))
     * // → prompts for password, returns { username: "user", password: "..." }
     */
    requireInput<T extends UIMessage>(msg: T): Promise<T["body"]>;
    /**
     * Renders a message to the user interface.
     * Must be implemented by subclasses.
     *
     * @param {UIMessage} message - Message to render.
     * @emits rendered
     * @throws {Error} If not implemented in subclass.
     */
    render(message: UIMessage): void;
}
import UIForm from './Form/Form.js';
import EventProcessor from '@nan0web/event/oop';
import CancelError from './Error/CancelError.js';
import OutputAdapter from './OutputAdapter.js';
import UIMessage from './Message/Message.js';
