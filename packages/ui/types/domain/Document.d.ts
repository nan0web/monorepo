export class Document extends Model {
    static title: {
        type: string;
        help: string;
    };
    static content: {
        type: string;
        model: typeof Content;
        help: string;
    };
    static $content: {
        type: string;
        model: typeof Content;
        help: string;
    };
    static nav: {
        type: string;
        model: typeof Navigation;
        help: string;
    };
    static langs: {
        type: string;
        model: typeof Language;
        help: string;
    };
    /**
     * Normalizes a URI for document fetching from DBFS.
     * @param {string} uri - The URI to normalize.
     * @param {import('@nan0web/db').DB} [db] - Optional DB instance.
     * @returns {string} The normalized URL suitable for `db.fetch()`.
     */
    static normalizeUrl(uri: string, db?: import("@nan0web/db").DB): string;
    /**
     * @param {Partial<Document> & Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<Document> & Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Title */ title: string;
    /** @type {Array<import('./Content.js').ContentData | any>} Content */ content: Array<import("./Content.js").ContentData | any>;
    /** @type {Array<import('./Content.js').ContentData | any>} Layout configuration */ $content: Array<import("./Content.js").ContentData | any>;
    /** @type {Navigation|string|Array<Navigation|any>|any} Navigation config */ nav: Navigation | string | Array<Navigation | any> | any;
    /** @type {Array<Language>} Supported languages */ langs: Array<Language>;
    /**
     * Resolves the nav field:
     * - If string "fieldName" → returns this[fieldName]
     * - If already Navigation / array / object → returns as-is
     * @returns {Navigation|Navigation[]|object|null}
     */
    resolveNav(): Navigation | Navigation[] | object | null;
    /**
     * Recursively expands $content blocks:
     * - Boolean true → looks up same-named field on this Document instance
     * - Object → recursively expand its children
     * - Other values → returned as-is
     * @param {Array} [blocks=this.$content]
     * @returns {Array}
     */
    resolveContent(blocks?: any[]): any[];
    /**
     * Resolve a single $content block item.
     * If the item has multiple boolean-true keys, each resolves to a separate block.
     * @param {any} item
     * @returns {any|Array}
     */
    resolveContentItem(item: any): any | any[];
    /**
     * Case-insensitive field lookup on the Document instance.
     * Tries: exact match → lowercase → title-case.
     * @param {string} key
     * @returns {any}
     */
    lookupField(key: string): any;
    /**
     * Normalizes a URI using this instance's attached DB (`this._.db`).
     * @param {string} uri
     * @param {import('@nan0web/db').DB | null} [db]
     * @returns {string}
     */
    normalizeUrl(uri: string, db?: import("@nan0web/db").DB | null): string;
}
import { Model } from '@nan0web/types';
import Navigation from './Navigation.js';
import { Language } from '@nan0web/i18n';
import { Content } from './Content.js';
