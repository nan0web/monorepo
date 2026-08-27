/**
 * Form module – generates and processes CLI forms from model schemas.
 *
 * @module ui/form
 */
import { Input } from './input.js';
import { select } from './select.js';
import { UiForm } from '@nan0web/ui';
/**
 * Generates a UiForm instance from a Body class static schema.
 *
 * @param {Function} BodyClass Class containing static field definitions.
 * @param {Object} [options={}] Options.
 * @param {Object} [options.initialState={}] Initial values for the form fields.
 * @param {Function} [options.t] Optional translation function.
 * @returns {UiForm} UiForm populated with fields derived from the schema.
 */
export declare function generateForm(BodyClass: Function, options?: {
    initialState?: any;
    t?: Function;
}): UiForm;
/**
 * CLI-specific form handler that introspects a model class for static field schemas.
 *
 * @class
 */
export default class Form {
    #private;
    options: {
        stops?: string[];
        inputFn?: (config: any) => Promise<any>;
        selectFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        autocompleteFn?: (config: any) => Promise<any>;
        maskFn?: (config: any) => Promise<any>;
        multiselectFn?: (config: any) => Promise<any>;
        datetimeFn?: (config: any) => Promise<any>;
        confirmFn?: (config: any) => Promise<any>;
        sliderFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        toggleFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        sortableFn?: (config: any) => Promise<any>;
        tableSelectFn?: (config: any) => Promise<any>;
        adapter?: any;
        console?: any;
        t?: Function | undefined;
        maxRetries?: number;
    };
    t: Function;
    select: typeof select | ((config: any) => Promise<import('@nan0web/ui').AskResponse>);
    /** @type {Function} Input handler with cancellation support. */
    handler: Function;
    /**
     * @param {Object} model - Model instance (e.g., new User({ username: argv[3] })).
     * @param {Object} [options={}] - Options.
     * @param {string[]} [options.stops=["quit", "cancel", "exit"]] - Stop words.
     * @param {(config: any) => Promise<any>} [options.inputFn] - Custom input function (supports config object).
     * @param {(config: any) => Promise<import('@nan0web/ui').AskResponse>} [options.selectFn] - Custom select function.
     * @param {(config: any) => Promise<any>} [options.autocompleteFn] - Custom autocomplete function.
     * @param {(config: any) => Promise<any>} [options.maskFn] - Custom mask function.
     * @param {(config: any) => Promise<any>} [options.multiselectFn] - Custom multiselect function.
     * @param {(config: any) => Promise<any>} [options.datetimeFn] - Custom datetime function.
     * @param {(config: any) => Promise<any>} [options.confirmFn] - Custom confirm function.
     * @param {(config: any) => Promise<import('@nan0web/ui').AskResponse>} [options.sliderFn] - Custom slider function.
     * @param {(config: any) => Promise<import('@nan0web/ui').AskResponse>} [options.toggleFn] - Custom toggle function.
     * @param {(config: any) => Promise<any>} [options.sortableFn] - Custom sortable function.
     * @param {(config: any) => Promise<any>} [options.tableSelectFn] - Custom tableSelect function.
     * @param {Object} [options.adapter] - Optional input adapter for global cancellation state.
     * @param {Object} [options.console] - Optional console for logging.
     * @param {Function} [options.t] - Optional translation function.
     * @param {number} [options.maxRetries] - Max retries before infinite loop detection.
     * @throws {TypeError} If model is not an object with a constructor.
     */
    constructor(model: any, options?: {
        stops?: string[];
        inputFn?: (config: any) => Promise<any>;
        selectFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        autocompleteFn?: (config: any) => Promise<any>;
        maskFn?: (config: any) => Promise<any>;
        multiselectFn?: (config: any) => Promise<any>;
        datetimeFn?: (config: any) => Promise<any>;
        confirmFn?: (config: any) => Promise<any>;
        sliderFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        toggleFn?: (config: any) => Promise<import('@nan0web/ui').AskResponse>;
        sortableFn?: (config: any) => Promise<any>;
        tableSelectFn?: (config: any) => Promise<any>;
        adapter?: any;
        console?: any;
        t?: Function;
        maxRetries?: number;
    });
    /**
     * Creates a {@link Form} instance directly from a Body schema.
     *
     * @param {typeof Object} BodyClass Class with static schema definitions.
     * @param {Object} [initialModel={}] Optional initial model data.
     * @param {Object} [options={}] Same options as the constructor.
     * @returns {Form} New Form instance.
     */
    static createFromBodySchema(BodyClass: typeof Object, initialModel?: any, options?: any): Form;
    get fields(): any[];
    /**
     * Prompts for input using the internal handler.
     *
     * @param {string} prompt - Input prompt.
     * @returns {Promise<Input>} Input result.
     */
    input(prompt: string, field?: {}): Promise<Input>;
    /**
     * Prompts for input, validates, and updates the model.
     * Supports linear navigation (::prev/::next) and all advanced CLI types.
     *
     * @returns {Promise<{cancelled: boolean}>} Result indicating if cancelled.
     * @throws {Error} Propagates non-cancellation errors.
     */
    requireInput(): Promise<{
        cancelled: boolean;
    }>;
    /**
     * Converts raw input value based on field schema.
     *
     * @param {Object} field - Field config.
     * @param {any} value - Input value.
     * @returns {string|number|boolean} Typed value.
     */
    convertValue(field: any, value: any): string | number | boolean;
    /** @returns {Object} The updated model instance or state object. */
    get body(): any;
}
export { Form };
