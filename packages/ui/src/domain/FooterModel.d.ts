import { Model } from '@nan0web/types';
import { Language } from '@nan0web/i18n';
import Navigation from './Navigation.js';
/**
 * FooterModel — OLMUI Component Model
 * Universal footer structure.
 */
export declare class FooterModel extends Model {
    #private;
    /** @type {Navigation[]} */
    nav: Navigation[];
    /** @type {Navigation[]} */
    share: Navigation[];
    /** @type {Language|null} */
    lang: Language | null;
    /** @type {Language[]} */
    langs: Language[];
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
        hint: typeof Language;
        default: never[];
    };
    /**
     * @param {Partial<FooterModel>} data
     */
    constructor(data?: Partial<FooterModel>);
}
