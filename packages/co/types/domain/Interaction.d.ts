/**
 * Interaction
 *
 * Fundamental exchange or event over time.
 * Extends Message so it inherently has time, body (content), and metadata.
 *
 * @class Interaction
 * @extends Message
 */
export default class Interaction extends Message {
    static title: {
        type: string;
    };
    static tags: {
        type: string;
        default: never[];
    };
    constructor(input?: {});
    /** @type {string} */
    title: string;
    /** @type {string[]} */
    tags: string[];
}
import Message from './Message.js';
