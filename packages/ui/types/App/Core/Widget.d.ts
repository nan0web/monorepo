/** @typedef {import("./UI.js").ComponentFn} ComponentFn */
/**
 * Abstract Widget class.
 * Widget is a view with ability to input data in a specific format.
 * Input and output data are typed classes.
 */
export default class Widget extends EventProcessor {
    /**
     * Creates a new Widget instance.
     * @param {View} [view] - View instance (default: new View())
     */
    constructor(view?: View);
    /** @type {View} The view associated with this widget */
    view: View;
    /**
     * Ask user for input data of specific class.
     * @param {UiMessage} input - instance of UiMessage or similar
     * @returns {Promise<UiMessage | null>} instance of UiMessage or null
     */
    ask(input: UiMessage): Promise<UiMessage | null>;
    /**
     * @param {AsyncGenerator<StreamEntry>} stream
     * @returns {Promise<void>}
     */
    read(stream: AsyncGenerator<StreamEntry>): Promise<void>;
    /**
     * Render output data using a view function.
     * @param {Function|string} viewFnOrName - View function or registered view name
     * @param {object} outputData - Typed output data instance
     * @returns {any} Rendered output
     * @throws {Error} If view component is not found when using string name
     */
    render(viewFnOrName: Function | string, outputData: object): any;
}
export type ComponentFn = import("./UI.js").ComponentFn;
import EventProcessor from '@nan0web/event/oop';
import View from '../../View/View.js';
import { UiMessage } from '../../core/index.js';
import { StreamEntry } from '@nan0web/db';
