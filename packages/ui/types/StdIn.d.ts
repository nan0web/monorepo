/**
 * Handles standard input stream with message buffering.
 */
export default class StdIn extends EventProcessor {
    /** @type {number} Read interval in milliseconds */
    static READ_INTERVAL: number;
    /** @type {string[]} Messages to ignore */
    static IGNORE_MESSAGES: string[];
    /**
     * Creates a StdIn instance from the given input.
     * @param {StdIn|object} input - The input to create from
     * @returns {StdIn} A StdIn instance
     */
    static from(input: StdIn | object): StdIn;
    /**
     * Creates a new StdIn instance.
     * @param {object} props - StdIn properties
     * @param {Processor} [props.processor] - Input processor
     * @param {UiMessage[]} [props.stream=[]] - Initial input stream
     */
    constructor(props?: {
        processor?: Processor | undefined;
        stream?: UiMessage[] | undefined;
    });
    /** @type {Processor} Input processor */
    processor: Processor;
    /** @type {UiMessage[]} Input message buffer */
    stream: UiMessage[];
    /**
     * Checks if there are messages waiting in the input stream.
     * @returns {boolean} True if waiting messages, false otherwise
     */
    get waiting(): boolean;
    /**
     * Checks if the input stream has ended (no messages left).
     * @returns {boolean} True if no messages left, false otherwise
     */
    get ended(): boolean;
    /**
     * Reads a message from the input stream.
     * Waits until messages are available if stream is empty.
     * @returns {Promise<UiMessage>} Next input message
     */
    read(): Promise<UiMessage>;
    /**
     * Writes a message to the input stream.
     * @param {string} message - Message to write
     * @returns {boolean} True if message accepted, False if ignored
     */
    write(message: string): boolean;
    /**
     * Decodes a message into an UiMessage instance.
     * @param {UiMessage | string[] | any} message - Message to decode
     * @returns {UiMessage} Decoded input message
     */
    decode(message: UiMessage | string[] | any): UiMessage;
}
import EventProcessor from '@nan0web/event/oop';
declare class Processor extends EventProcessor {
}
import { UiMessage } from './core/index.js';
export {};
