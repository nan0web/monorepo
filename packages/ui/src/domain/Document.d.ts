import { Model } from '@nan0web/types';
import { Content } from './Content.js';
import Navigation from './Navigation.js';
import { Language } from '@nan0web/i18n';
export declare class Document extends Model {
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
    static normalizeUrl(uri: string, db?: import('@nan0web/db').DB): string;
    /**
     * @param {Partial<Document>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<Document>, options?: Partial<import('@nan0web/types').ModelOptions>);
    /**
     * Normalizes a URI using this instance's attached DB (`this._.db`).
     * @param {string} uri
     * @param {import('@nan0web/db').DB} [db]
     * @returns {string}
     */
    normalizeUrl(uri: string, db?: import('@nan0web/db').DB): string;
}
