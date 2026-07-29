/**
 * @file Page Model — describes a page in the pages.yaml router.
 *
 * A Page captures the declarative description of a route.
 * Extends ContainerObject for recursive tree operations.
 */
export default class Page extends ContainerObject {
    static slug: {
        help: string;
        placeholder: string;
        type: string;
        required: boolean;
        default: string;
    };
    static title: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static source: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static layout: {
        help: string;
        placeholder: string;
        type: string;
        options: string[];
        default: string;
    };
    static icon: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static hidden: {
        help: string;
        type: string;
        default: boolean;
    };
    static content: {
        help: string;
        type: string;
        default: string;
    };
    static $content: {
        help: string;
        type: string;
        default: null;
        hidden: boolean;
    };
    /**
     * @param {object} input
     * @returns {Page}
     */
    static from(input: object): Page;
    /**
     * @param {object} [input]
     */
    constructor(input?: object);
    /** @type {string} URL path segment */ slug: string;
    /** @type {string} Display title (i18n key or raw string) */ title: string;
    /** @type {string} Data binding key in Global State (e.g. "court.cases") */ source: string;
    /** @type {string} Rendering strategy */ layout: string;
    /** @type {string} Optional icon identifier */ icon: string;
    /** @type {boolean} Excluded from navigation */ hidden: boolean;
    /** @type {string} Raw or Markdown content of the page */ content: string;
    /** @type {Array<any>|null} Parsed OLMUI renderable blocks */ $content: Array<any> | null;
    /** @type {Page[]} Child pages */ children: Page[];
    /** @type {number} Navigation order (from __order.yaml) */ _order: number;
    /**
     * Full path from root (recursively built by Router).
     * @type {string}
     */
    get path(): string;
}
import { ContainerObject } from '@nan0web/types';
