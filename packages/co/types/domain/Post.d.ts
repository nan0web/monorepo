/**
 * Post
 *
 * A rich piece of content. Extends Chat to optionally support threading/chains.
 * Supports hybrid media formatting:
 * - Format A (Anchor shortcodes in Markdown): ::media[id] or ![[id]] referencing Media.id
 * - Format B (Placement directive): positioned by Media.placement (e.g. after_paragraph: 2)
 *
 * @class Post
 * @extends Chat
 */
export default class Post extends Chat {
    static id: {
        type: string;
        help: string;
    };
    static title: {
        type: string;
        help: string;
    };
    static tags: {
        type: string;
        default: never[];
        help: string;
    };
    static media: {
        type: (typeof Media)[];
        default: never[];
        help: string;
    };
    constructor(input?: {});
    /** @type {string} */
    id: string;
    /** @type {string} */
    title: string;
    /** @type {string[]} */
    tags: string[];
    /** @type {Media[]} */
    media: Media[];
}
import Chat from './Chat.js';
import Media from './Media.js';
