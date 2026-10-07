/**
 * Chat message class.
 *
 * Represents a message in a chat with an author and optional next message,
 * forming a singly linked list of chat entries.
 *
 * @class Chat
 * @extends Message
 */
export default class Chat extends Message {
    /**
     * Create Chat instance from input.
     *
     * @param {any} input - Input to create chat from.
     * @returns {Chat}
     */
    static from(input: any): Chat;
    /**
     * Escape chat body to prevent injection of message separators.
     *
     * @param {any} body - Body to escape.
     * @returns {string} Escaped body string.
     */
    static escape(body: any): string;
    /**
     * Parse a raw chat string into an array of message objects.
     *
     * @param {string} chat - String chat to parse.
     * @returns {Array} Array of parsed message objects.
     */
    static parse(chat: string): any[];
    /**
     * Create a new Chat instance.
     *
     * @param {object} [input={}] - Chat properties or a raw string.
     * @param {Contact} [input.author] - Message author.
     * @param {Chat} [input.next] - Next message in chat chain.
     * @param {any} [input.body] - Message body.
     * @param {Date|number} [input.time] - Message timestamp.
     */
    constructor(input?: {
        author?: Contact | undefined;
        next?: Chat | undefined;
        body?: any;
        time?: number | Date | undefined;
    });
    /** @type {Contact} */
    author: Contact;
    /** @type {Chat|null} */
    next: Chat | null;
    /**
     * Get the size of the chat chain.
     *
     * @returns {number} Number of messages in the chain.
     */
    get size(): number;
    /**
     * Get the most recent (last) message in the chat chain.
     *
     * @returns {Chat} The last chat message.
     */
    get recent(): Chat;
}
import Message from './Message.js';
import Contact from './Contact.js';
