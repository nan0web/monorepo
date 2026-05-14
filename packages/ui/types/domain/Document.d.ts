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
        model: any;
        help: string;
    };
    /**
     *
     * @param {Partial<Document>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<Document>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Title */ title: string;
    /** @type {Array<Content>} Content */ content: Array<Content>;
    /** @type {Array<Content>} Layout configuration */ $content: Array<Content>;
    /** @type {Navigation|string|Array<Navigation>} Navigation config */ nav: Navigation | string | Array<Navigation>;
    /** @type {Array<Language>} Supported languages */ langs: Array<Language>;
}
import { Model } from '@nan0web/types';
import { Content } from './Content.js';
import Navigation from './Navigation.js';
