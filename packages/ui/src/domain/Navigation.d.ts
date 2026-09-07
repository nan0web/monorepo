/**
 * Navigation Model — OLMUI Model-as-Schema
 * Generic recursive navigation structure for all UI platforms (CLI, Web, Mobile).
 */
export default class Navigation extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static href: {
        help: string;
        placeholder: string;
        default: string;
    };
    static icon: {
        help: string;
        placeholder: string;
        default: string;
    };
    static image: {
        help: string;
        placeholder: string;
        default: string;
    };
    static children: {
        help: string;
        type: string;
        hint: typeof Navigation;
        default: never[];
    };
    static hidden: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {Partial<Navigation> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<Navigation> | Record<string, any>, options?: object);
    /** @type {string} Label for the menu item */ title: string;
    /** @type {string} URL or internal app route */ href: string;
    /** @type {string} Icon name/ID */ icon: string;
    /** @type {string} Display image or thumbnail */ image: string;
    /** @type {Navigation[]} Nested sub-menu navigation */ children: Navigation[];
    /** @type {boolean} Hide from lists/menus */ hidden: boolean;
}
import { Model } from '@nan0web/types';
