import Message from './Message.js';
export type OutputMessageInput = {
    /**
     * - Content lines.
     */
    content?: string[];
    /**
     * - Raw body (overrides *content* if provided).
     */
    body?: any;
    /**
     * - Additional metadata.
     */
    head?: Record<string, any>;
    /**
     * - Associated error object.
     */
    error?: Error | null;
    /**
     * - Message priority.
     */
    priority?: number;
    /**
     * - Message type.
     */
    type?: string;
    /**
     * - Unique identifier.
     */
    id?: string;
    /**
     * - Timestamp.
     */
    time?: Date | number;
};
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
    /**
     * Create a new OutputMessage.
     *
     * @param {OutputMessageInput|string|string[]|Error} [input={}]
     */
    constructor(input?: OutputMessageInput | string | string[] | Error);
    /** @returns {any[]} */
    get content(): any[];
    /** @param {string[]|string} value */
    set content(value: string[] | string);
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
    /**
     * Create an OutputMessage from plain input.
     *
     * @param {Object} input
     * @returns {OutputMessage}
     */
    static from(input: any): OutputMessage;
}
