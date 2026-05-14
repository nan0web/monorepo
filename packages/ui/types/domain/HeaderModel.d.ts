/**
 * HeaderModel — OLMUI Component Model
 * Universal header structure with logo, navigation, and language controls.
 */
export class HeaderModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static logo: {
        help: string;
        placeholder: string;
        default: string;
    };
    static logoDark: {
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
    static actions: {
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
        default: never[];
    };
    /**
     * @param {Partial<HeaderModel>} data
     */
    constructor(data?: Partial<HeaderModel>);
    /** @type {string} */ title: string;
    /** @type {string} */ logo: string;
    /** @type {string} */ logoDark: string;
    /** @type {Navigation[]} */
    nav: Navigation[];
    /** @type {Navigation[]} */
    actions: Navigation[];
    /** @type {Navigation[]} */
    share: Navigation[];
    /** @type {any} */
    lang: any;
    /** @type {any[]} */
    langs: any[];
    #private;
}
import { Model } from '@nan0web/types';
import Navigation from './Navigation.js';
