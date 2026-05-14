/**
 * @typedef {Object} OutputMessageInput
 * @property {string[]} [content=[]] - Content lines.
 * @property {any} [body] - Raw body (overrides *content* if provided).
 * @property {Record<string, any>} [head={}] - Additional metadata.
 * @property {Error|null} [error=null] - Associated error object.
 * @property {number} [priority=OutputMessage.PRIORITY.NORMAL] - Message priority.
 * @property {string} [type=OutputMessage.TYPES.INFO] - Message type.
 * @property {string} [id] - Unique identifier.
 * @property {Date|number} [time=new Date()] - Timestamp.
 */
/**
 * OutputMessage – message sent from the system to the UI.
 *
 * Extends {@link Message} with richer metadata, priority handling and error support.
 *
 * @class OutputMessage
 * @extends Message
 */
export default class OutputMessage extends Message {
    static PRIORITY: {
        LOW: number;
        NORMAL: number;
        HIGH: number;
        CRITICAL: number;
    };
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
     * Create an OutputMessage from plain input.
     *
     * @param {Object} input
     * @returns {OutputMessage}
     */
    static from(input: any): OutputMessage;
    /**
     * Create a new OutputMessage.
     *
     * @param {OutputMessageInput|string|string[]|Error} [input={}]
     */
    constructor(input?: OutputMessageInput | string | string[] | Error);
    /** @type {string[]} */
    body: string[];
    /** @type {Object} */
    head: any;
    /** @type {Error|null} */
    error: Error | null;
    /** @type {number} */
    priority: number;
    /** @type {string} */
    type: string;
    /** @type {string} */
    id: string;
    /** @param {string[]|string} value */
    set content(value: string[] | string);
    /** @returns {any[]} */
    get content(): any[];
    /** @returns {number} */
    get size(): number;
    /** @returns {boolean} */
    get isError(): boolean;
    /** @returns {boolean} */
    get isInfo(): boolean;
    /**
     * Check whether the message type is a known enum value.
     *
     * @returns {boolean}
     */
    isValidType(): boolean;
    /**
     * Determine whether the message contains any body content.
     *
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Combine this message with additional OutputMessages.
     *
     * @param {...OutputMessage} messages
     * @returns {OutputMessage}
     */
    combine(...messages: OutputMessage[]): OutputMessage;
    /**
     * Serialise the message to a plain JSON object.
     *
     * @returns {Object}
     */
    toJSON(): any;
}
export type OutputMessageInput = {
    /**
     * - Content lines.
     */
    content?: string[] | undefined;
    /**
     * - Raw body (overrides *content* if provided).
     */
    body?: any;
    /**
     * - Additional metadata.
     */
    head?: Record<string, any> | undefined;
    /**
     * - Associated error object.
     */
    error?: Error | null | undefined;
    /**
     * - Message priority.
     */
    priority?: number | undefined;
    /**
     * - Message type.
     */
    type?: string | undefined;
    /**
     * - Unique identifier.
     */
    id?: string | undefined;
    /**
     * - Timestamp.
     */
    time?: number | Date | undefined;
};
import Message from './Message.js';
