/**
 * NewsPostModel (v2)
 *
 * Domain model for articles and news posts.
 * Defines the canonical structure for multimedia content.
 */
export default class NewsPostModel extends Model {
    static label: string;
    static title: {
        help: string;
        default: string;
        type: string;
        required: boolean;
    };
    static author: {
        help: string;
        default: string;
        type: string;
    };
    static date: {
        help: string;
        default: () => string;
        type: string;
    };
    static image: {
        help: string;
        default: string;
        type: string;
    };
    static images: {
        help: string;
        default: never[];
        type: string;
    };
    static video: {
        help: string;
        default: string;
        type: string;
    };
    static url: {
        help: string;
        default: string;
        type: string;
    };
    static excerpt: {
        help: string;
        default: string;
        type: string;
    };
    static content: {
        help: string;
        default: string;
        type: string;
    };
    static categories: {
        help: string;
        default: never[];
        type: string;
    };
    /**
     * @param {Partial<NewsPostModel> | Record<string, any>} [data]
     * @param {object} [options]
     */
    constructor(data?: Partial<NewsPostModel> | Record<string, any>, options?: object);
    /** @type {string} */ id: string;
    /** @type {string} */ title: string;
    /** @type {string} */ author: string;
    /** @type {string} */ date: string;
    /** @type {string} */ image: string;
    /** @type {string[]} */ images: string[];
    /** @type {string} */ video: string;
    /** @type {string} */ url: string;
    /** @type {string} */ excerpt: string;
    /** @type {string} */ content: string;
    /** @type {any[]} */ categories: any[];
}
import { Model } from '@nan0web/types';
