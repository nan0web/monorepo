/**
 * @typedef {object} MessageInput
 * @property {Record<string, any>} [input.head] - Message head.
 * @property {any} [input.body] - Message body.
 * @property {Date|number} [input.time] - Creation timestamp.
 */
/**
 * @typedef {(value: any) => true | string | string[]} ValidateFn
 */
/**
 * @typedef {Object} MessageBodySchema
 * @property {string}     [alias]        - Short alias (single‑letter).
 * @property {any}        [defaultValue] - Default value.
 * @property {string}     [help]         - Human readable description.
 * @property {Array}      [options]      - Array of possible options.
 * @property {RegExp}     [pattern]      - Regular expression pattern for validation.
 * @property {string}     [placeholder]  - Placeholder for usage (e.g. "<user>").
 * @property {boolean}    [required]     - Is field required or not.
 * @property {any}        [type]         - Data type.
 * @property {ValidateFn} [validate]     - Validate function.
 */
/**
 * Base Message class.
 *
 * Provides a timestamped container for arbitrary payload data,
 * validation utilities via a static Body schema and
 * a generic {@link parseBody} helper.
 *
 * @class Message
 * @property {Record<string, any>} head - Message head.
 * @property {any} body - Message body.
 * @property {Date} time - Creation timestamp.
 * @property {boolean} isValid - True if message is valid.
 */
export default class Message {
    /**
     * Body class defines the meta data for the body object.
     *
     * Sub‑classes can extend this class to declare fields,
     * default values, validation functions and attribute metadata.
     */
    static Body: {
        new (): {};
    };
    /**
     * Create a Message instance from a simple value.
     *
     * @param {any} input - Body string, object or existing Message.
     * @returns {Message}
     */
    static from(input: any): Message;
    /**
     * Parse raw input according to a schema.
     *
     * Handles alias mapping, default values and enum validation.
     *
     * @param {Record<string, any>} input - Raw input object.
     * @param {Record<string, any> | Function} Body - Schema definition.
     * @returns {Record<string, any>} Parsed and validated result.
     * @throws {Error} When a value fails enum validation.
     */
    static parseBody(input: Record<string, any>, Body: Record<string, any> | Function): Record<string, any>;
    /**
     * Create a new Message instance.
     *
     * @param {MessageInput} [input={}]
     */
    constructor(input?: MessageInput);
    /** @type {Record<string, any>} */
    head: Record<string, any>;
    /** @type {any} */
    body: any;
    /**
     * Check whether the message has no body and no head.
     *
     * @returns {boolean}
     */
    get empty(): boolean;
    /**
     * Returns true if the message passes validation.
     *
     * @returns {boolean}
     */
    get isValid(): boolean;
    /**
     * Get message creation time.
     *
     * @returns {Date}
     */
    get time(): Date;
    /**
     * Validate body fields according to the static {@link Body} schema.
     *
     * @deprecated Moved to validate()
     * @returns {Record<string, string[]>} Mapping of field names to error messages.
     */
    getErrors(): Record<string, string[]>;
    /**
     * Convert message to plain object form.
     *
     * @returns {{body:any, time:number}} Object with body and timestamp.
     */
    toObject(): {
        body: any;
        time: number;
    };
    /**
     * Convert message to a string with ISO timestamp.
     *
     * @returns {string}
     */
    toString(): string;
    /**
     * Validates the message's body.
     * @returns {Map<string, string>} A map of errors for every incorrect field, empty map if no errors.
     */
    validate(): Map<string, string>;
    #private;
}
export type MessageInput = {
    /**
     * - Message head.
     */
    head?: Record<string, any> | undefined;
    /**
     * - Message body.
     */
    body?: any;
    /**
     * - Creation timestamp.
     */
    time?: number | Date | undefined;
};
export type ValidateFn = (value: any) => true | string | string[];
export type MessageBodySchema = {
    /**
     * - Short alias (single‑letter).
     */
    alias?: string | undefined;
    /**
     * - Default value.
     */
    defaultValue?: any;
    /**
     * - Human readable description.
     */
    help?: string | undefined;
    /**
     * - Array of possible options.
     */
    options?: any[] | undefined;
    /**
     * - Regular expression pattern for validation.
     */
    pattern?: RegExp | undefined;
    /**
     * - Placeholder for usage (e.g. "<user>").
     */
    placeholder?: string | undefined;
    /**
     * - Is field required or not.
     */
    required?: boolean | undefined;
    /**
     * - Data type.
     */
    type?: any;
    /**
     * - Validate function.
     */
    validate?: ValidateFn | undefined;
};
