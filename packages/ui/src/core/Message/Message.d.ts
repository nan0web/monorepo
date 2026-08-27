import { Message } from '@nan0web/co';
export type MessageBodySchema = {
    required?: boolean;
    help?: string;
    pattern?: RegExp;
    options?: string[];
    defaultValue?: any;
    validate?: Function;
};
/**
 * @typedef {Object} MessageBodySchema
 * @property {boolean} [required]
 * @property {string} [help]
 * @property {RegExp} [pattern]
 * @property {string[]} [options]
 * @property {*} [defaultValue]
 * @property {Function} [validate]
 */
/**
 * Base message class for UI communications.
 * A message holds structured data (body) defined by a static Body class.
 * It can represent commands, forms, alerts, or any UI unit.
 *
 * @class UiMessage
 * @extends Message
 * @property {Record<string, any>} head - Message head.
 * @property {boolean} isValid - True if message is valid.
 * @property {Date} time - Creation timestamp.
 *
 * @example
 * class UserLoginMessage extends UiMessage {
 *   static Body = class {
 *     static username = { required: true, help: "Enter username" }
 *     static password = { required: true, type: "password" }
 *     constructor({ username = "", password = "" }) {
 *       this.username = username
 *       this.password = password
 *     }
 *   }
 * }
 */
export default class UiMessage extends Message {
    /** @type {string} */
    id: string;
    /** @type {string} */
    type: string;
    static TYPES: {
        TEXT: string;
        FORM: string;
        PROGRESS: string;
        ERROR: string;
        INFO: string;
        SUCCESS: string;
        WARNING: string;
        COMMAND: string;
        NAVIGATION: string;
    };
    /**
     * Creates a UiMessage.
     *
     * @param {Object} [input={}] - Message properties.
     */
    constructor(input?: any);
    /**
     * Checks whether the message contains any body content.
     *
     * @returns {boolean}
     */
    get empty(): boolean;
    /**
     * Validates the message body against its schema.
     *
     * NOTE: The signature must exactly match `Message.validate` – it returns a
     * `Map<string,string>` regardless of the generic type, otherwise TypeScript
     * reports incompatibility with the base class.
     *
     * @param {any} [body=this.body] - Optional body to validate.
     * @returns {Map<string,string>} Map of validation errors, empty if valid.
     */
    validate(body?: any): Map<string, string>;
    /**
     * Checks if the message type is valid.
     *
     * @returns {boolean}
     */
    isValidType(): boolean;
    /**
     * Creates a UiMessage instance from plain data.
     *
     * @param {Object} data - Message data.
     * @returns {UiMessage}
     */
    static from(data: any): UiMessage;
    /**
     * Initializes body from input using static Body schema.
     *
     * @param {Object} input - Input object.
     * @param {Function} BodyClass - Static body class with defaults and schema.
     * @returns {Object} Parsed body.
     */
    static parseBody(input: any, BodyClass: Function): any;
}
