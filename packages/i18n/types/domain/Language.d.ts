/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA' | string} Locale */
/**
 * @property {string} title Language title
 * @property {Locale} locale Locale
 * @property {string} icon Language icon
 */
export class Language extends Model {
    static title: {
        help: string;
        default: string;
    };
    static locale: {
        help: string;
        errorNotFound: string;
        errorInvalidFormat: string;
        /** @type {Locale} */
        default: Locale;
        validate: (str: string) => string | true;
    };
    static icon: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<Language> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<Language> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Language title */ title: string;
    /** @type {Locale} */ locale: Locale;
    /** @type {string} Language icon */ icon: string;
}
export type Locale = "en" | "en_GB" | "en_US" | "uk" | "uk_UA" | string;
import { Model } from '@nan0web/types';
