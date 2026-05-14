/** @typedef {{id: string, icon?: string, locale?: string}} Language */
/**
 * Core application class that handles database operations and internationalization.
 *
 * @class
 * @property {DB} db - Database instance for data operations
 * @property {string} locale - Current locale identifier (e.g. 'uk', 'en')
 * @property {object} data - Application data storage
 * @property {Record<string, Function>} actions - Application actions registry
 * @property {object} meta - Application metadata
 * @property {Function} t - Translation function
 */
export default class AppCore {
    static get DB(): typeof DB;
    static UI: {
        title: string;
        description: string;
        icon: string;
    };
    static title: {
        default: string;
    };
    static uri: {
        default: string;
    };
    static locale: {
        default: string;
    };
    static data: {
        default: {};
    };
    static actions: {
        default: {};
    };
    static meta: {
        default: {};
    };
    static langs: {
        default: {
            en: {
                id: string;
                icon: string;
                locale: string;
            };
        };
    };
    static from(input: any): AppCore;
    /**
     * Create an AppCore instance
     * @param {object} input - Application configuration
     */
    constructor(input?: object);
    /** @type {DB} */
    db: DB;
    /** @type {string} */
    title: string;
    /** @type {string} */
    uri: string;
    /** @type {string} */
    locale: string;
    /** @type {object} */
    data: object;
    /** @type {Record<string, Function>} */
    actions: Record<string, Function>;
    /** @type {object} */
    meta: object;
    /** @type {object} */
    langs: object;
    /** @type {object} */
    element: object;
    /** @type {(key: string, replacements?: Record<string, string>) => string} */
    t: (key: string, replacements?: Record<string, string>) => string;
    /**
     * Bootstrap internationalization by loading translations from database
     * @param {string} path - Path to i18n file with locale placeholder
     * @returns {Promise<void>}
     */
    bootstrapI18n(path?: string): Promise<void>;
    /**
     * Initializes the application with async load.
     * @returns {Promise<boolean>} True if initilized first time, false if already initialized
     */
    init(): Promise<boolean>;
    /**
     * Get current application state
     * @returns {{ data: any, actions: Record<string, Function>, meta: any, t: Function }} Current state object
     */
    state(): {
        data: any;
        actions: Record<string, Function>;
        meta: any;
        t: Function;
    };
    /**
     * Main application execution method
     * @abstract Must be implemented in subclass
     * @returns {Promise<AppResult>}
     */
    run(): Promise<AppResult>;
    #private;
}
export type Language = {
    id: string;
    icon?: string;
    locale?: string;
};
import DB from '@nan0web/db';
import AppResult from './AppResult.js';
