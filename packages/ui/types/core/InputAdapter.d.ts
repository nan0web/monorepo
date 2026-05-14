/**
 * @typedef {Object} AskOptions
 * @property {boolean} [silent] - Suppress logs or output.
 * @property {string} [title] - Custom title for the prompt.
 * @property {string} [hint] - Presentation hint (e.g., 'password', 'tree', 'markdown').
 * @property {any} [default] - Default value if no input is provided.
 * @property {Array<string|Object>} [options] - Array of options for select inputs.
 * @property {Record<string, any>} [UI] - Localization dictionary/overrides.
 * @property {string} [component] - Target specific component override.
 */
/** @typedef {import('./index.js').AskResponse} AskResponse */
/**
 * Abstract input adapter for UI implementations.
 *
 * @class InputAdapter
 * @extends Event
 */
export class InputAdapter extends Event {
    static CancelError: typeof CancelError;
    /** @returns {typeof CancelError} */
    get CancelError(): typeof CancelError;
    /**
     * Starts listening for input and emits an `input` event.
     *
     * @returns {void}
     */
    start(): void;
    /**
     * Stops listening for input. Default implementation does nothing.
     *
     * @returns {void}
     */
    stop(): void;
    /**
     * Checks whether the adapter is ready to receive input.
     *
     * @returns {boolean} Always true in base class.
     */
    isReady(): boolean;
    /**
     * Helper to ask a question.
     * @param {string|import('./Message/Message.js').default|any} question - Question to ask, Form instance, or AskIntent.
     * @param {AskOptions} [options] - Additional options.
     * @returns {Promise<AskResponse>}
     */
    ask(question: string | import("./Message/Message.js").default | any, options?: AskOptions): Promise<AskResponse>;
    /**
     * Generic selection prompt.
     * @param {Object} config - Selection configuration.
     * @returns {Promise<{ index?: number, value: string | null }>}
     */
    select(config: any): Promise<{
        index?: number;
        value: string | null;
    }>;
}
export default InputAdapter;
export type AskOptions = {
    /**
     * - Suppress logs or output.
     */
    silent?: boolean | undefined;
    /**
     * - Custom title for the prompt.
     */
    title?: string | undefined;
    /**
     * - Presentation hint (e.g., 'password', 'tree', 'markdown').
     */
    hint?: string | undefined;
    /**
     * - Default value if no input is provided.
     */
    default?: any;
    /**
     * - Array of options for select inputs.
     */
    options?: any[] | undefined;
    /**
     * - Localization dictionary/overrides.
     */
    UI?: Record<string, any> | undefined;
    /**
     * - Target specific component override.
     */
    component?: string | undefined;
};
export type AskResponse = import("./index.js").AskResponse;
import Event from '@nan0web/event/oop';
import CancelError from './Error/CancelError.js';
