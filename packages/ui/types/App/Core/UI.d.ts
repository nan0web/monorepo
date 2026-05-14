/** @typedef {import("../../View/View.js").ComponentFn} ComponentFn */
/**
 * Abstract UI class to connect apps and widgets.
 * Supports input/output data typed classes and views.
 */
export default class UI extends Widget {
    /**
     * Creates a new UI instance.
     * @param {CoreApp} app - The app to connect to this UI
     * @param {View} [view] - View instance for rendering (default: new View())
     */
    constructor(app: CoreApp, view?: View);
    /** @type {CoreApp} The app instance connected to this UI */
    app: CoreApp;
    /**
     * Convert raw input to Message array.
     * Must be implemented by subclasses.
     * @param {any} rawInput - Raw input to convert
     * @returns {Message[]} Array of command messages
     * @throws {Error} Always thrown as this method must be implemented by subclasses
     */
    convertInput(rawInput: any): Message[];
    /**
     * Sets up event handlers for UI process events.
     * @param {ComponentFn} UIProcess - Process view component
     */
    show(UIProcess: ComponentFn): void;
    /**
     * Output results to the interface.
     * @param {any[]} results - Results to output
     */
    output(results: any[]): void;
}
export type ComponentFn = import("../../View/View.js").ComponentFn;
import Widget from './Widget.js';
import CoreApp from './CoreApp.js';
import { Message } from '@nan0web/co';
import View from '../../View/View.js';
