/**
 * FooterModel — OLMUI Component Model
 * Universal footer structure.
 */
export class FooterModel extends Model {
    static $id: string;
    static copyright: {
        help: string;
        placeholder: string;
        default: string;
    };
    static version: {
        help: string;
        placeholder: string;
        default: string;
    };
    static license: {
        help: string;
        placeholder: string;
        default: string;
    };
    static nav: {
        help: string;
        type: string;
        hint: typeof Navigation;
        default: never[];
    };
    static share: {
        help: string;
        type: string;
        hint: typeof Navigation;
        default: never[];
    };
    static lang: {
        help: string;
        default: null;
    };
    static langs: {
        help: string;
        type: string;
        hint: any;
        default: never[];
    };
    /**
     * @param {Partial<FooterModel>} data
     */
    constructor(data?: Partial<FooterModel>);
    /** @type {string} */ copyright: string;
    /** @type {string} */ version: string;
    /** @type {string} */ license: string;
    /** @type {Navigation[]} */
    nav: Navigation[];
    /** @type {Navigation[]} */
    share: Navigation[];
    /** @type {Language|null} */
    lang: Language | null;
    /** @type {Language[]} */
    langs: Language[];
    #private;
}
import { Model } from '@nan0web/types';
import Navigation from './Navigation.js';
