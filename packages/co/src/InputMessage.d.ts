import Message from './Message.js';
export type InputMessageValue = Partial<Message> | null;
/**
 * @typedef {Partial<Message> | null} InputMessageValue
 *
 * Represents a message input with value, options and metadata.
 *
 * @class InputMessage
 */
export default class InputMessage {
    #private;
    /** Escape character (ESC) */
    static ESCAPE: string;
    /** @type {typeof Message} */
    static Message: typeof Message;
    /** @type {Message} */
    value: Message;
    /** @type {string[]} */
    options: string[];
    /** @type {boolean} */
    waiting: boolean;
    /**
     * Create a new InputMessage.
     *
     * @param {object} [props={}]
     * @param {InputMessageValue} [props.value=null] - Input value.
     * @param {string[]|string} [props.options=[]] - Available options.
     * @param {boolean} [props.waiting=false] - Waiting flag.
     * @param {boolean} [props.escaped=false] - Whether to store the ESCAPE character.
     */
    constructor(props?: {
        value?: InputMessageValue;
        options?: string[] | string;
        waiting?: boolean;
        escaped?: boolean;
    });
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
    /**
     * Create InputMessage from various values.
     *
     * @param {InputMessage|object|string} value
     * @returns {InputMessage}
     */
    static from(value: InputMessage | object | string): InputMessage;
}
