/**
 * @typedef {Partial<Message> | null} InputMessageValue
 *
 * @typedef {Object} InputMessageProps
 * @property {InputMessageValue} [value=null] - Input value.
 * @property {string[]|string} [options=[]] - Available options.
 * @property {boolean} [waiting=false] - Waiting flag.
 * @property {boolean} [escaped=false] - Whether to store the ESCAPE character.
 *
 * Represents a message input with value, options and metadata.
 *
 * @class InputMessage
 */
export default class InputMessage {
    /** Escape character (ESC) */
    static ESCAPE: string;
    /** @type {typeof Message} */
    static Message: typeof Message;
    /**
     * Create InputMessage from various values.
     *
     * @param {InputMessage|object|string} value
     * @returns {InputMessage}
     */
    static from(value: InputMessage | object | string): InputMessage;
    /**
     * Create a new InputMessage.
     *
     * @param {InputMessageProps|string} [props={}]
     */
    constructor(props?: InputMessageProps | string);
    /** @type {Message} */
    value: Message;
    /** @type {string[]} */
    options: string[];
    /** @type {boolean} */
    waiting: boolean;
    /** @returns {string} */
    get ESCAPE(): string;
    /** @returns {typeof Message} */
    get Message(): typeof Message;
    /** @returns {boolean} */
    get empty(): boolean;
    /** @returns {number} */
    get time(): number;
    /** @returns {boolean} */
    get isEscaped(): boolean;
    /** @returns {boolean} */
    get isValid(): boolean;
    /**
     * Convert to plain object, including timestamp.
     *
     * @returns {object}
     */
    toObject(): object;
    /**
     * Convert to string representation.
     *
     * @returns {string}
     */
    toString(): string;
    #private;
}
export type InputMessageValue = Partial<Message> | null;
export type InputMessageProps = {
    /**
     * - Input value.
     */
    value?: InputMessageValue | undefined;
    /**
     * - Available options.
     */
    options?: string | string[] | undefined;
    /**
     * - Waiting flag.
     */
    waiting?: boolean | undefined;
    /**
     * - Whether to store the ESCAPE character.
     *
     * Represents a message input with value, options and metadata.
     */
    escaped?: boolean | undefined;
};
import Message from './Message.js';
