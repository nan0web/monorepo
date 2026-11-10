/**
 * Post
 *
 * A rich piece of content (Page, Post, News, Doc, Case).
 * Extends Chat to natively support message chains, comment trees, and authoring.
 * Supports both string[] media references (Fractal 7i) and Media[] objects (backward compatibility).
 *
 * @class Post
 * @extends Chat
 */
export default class Post extends Chat {
    static id: {
        type: string;
        help: string;
    };
    static type: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Type must be page, post, news, doc, or case";
    };
    static title: {
        type: string;
        help: string;
        default: string;
    };
    static excerpt: {
        type: string;
        help: string;
        default: string;
    };
    static body: {
        type: string;
        help: string;
        default: string;
    };
    static time: {
        type: string;
        help: string;
    };
    static status: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Invalid status";
    };
    static authors: {
        type: string;
        default: never[];
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
    /**
     * @param {Record<string, any>} [input]
     */
    constructor(input?: Record<string, any>);
    /** @type {string} */
    id: string;
    /** @type {'page' | 'post' | 'news' | 'doc' | 'case'} */
    type: "page" | "post" | "news" | "doc" | "case";
    /** @type {string} */
    title: string;
    /** @type {string} */
    excerpt: string;
    /** @type {'draft' | 'plan' | 'live' | 'archived' | 'deleted'} */
    status: "draft" | "plan" | "live" | "archived" | "deleted";
    /** @type {string[]} */
    tags: string[];
    /** @type {Array<Media|string>} */
    media: Array<Media | string>;
    /** @type {Contact[]} */
    authors: Contact[];
}
import Chat from './Chat.js';
import Media from './Media.js';
import Contact from './Contact.js';
