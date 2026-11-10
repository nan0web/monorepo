/**
 * Interaction
 *
 * Fundamental exchange, ticket, inquiry, or order over time.
 * Extends Message so it inherently has time, body (content), and metadata.
 *
 * @class Interaction
 * @extends Message
 */
export default class Interaction extends Message {
    static id: {
        type: string;
        help: string;
    };
    static type: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true;
    };
    static title: {
        type: string;
        help: string;
        default: string;
    };
    static status: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Invalid interaction status";
    };
    static sender: {
        type: string;
        help: string;
    };
    static payload: {
        type: string;
        default: {};
        help: string;
    };
    static tags: {
        type: string;
        default: never[];
        help: string;
    };
    /**
     * @param {Record<string, any>} [input]
     */
    constructor(input?: Record<string, any>);
    /** @type {string} */
    id: string;
    /** @type {string} */
    type: string;
    /** @type {string} */
    title: string;
    /** @type {'new' | 'pending' | 'processing' | 'resolved' | 'rejected' | 'spam' | 'archived'} */
    status: "new" | "pending" | "processing" | "resolved" | "rejected" | "spam" | "archived";
    /** @type {Contact} */
    sender: Contact;
    /** @type {Record<string, any>} */
    payload: Record<string, any>;
    /** @type {string[]} */
    tags: string[];
}
import Message from './Message.js';
import Contact from './Contact.js';
