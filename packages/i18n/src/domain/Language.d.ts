import { Model } from '@nan0web/types';
export type Locale = 'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA' | string;
/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA' | string} Locale */
/**
 * @property {string} title Language title
 * @property {Locale} locale Locale
 * @property {string} icon Language icon
 */
export declare class Language extends Model {
    static title: {
        help: string;
        default: string;
    };
    static locale: {
        help: string;
        errorNotFound: string;
        errorInvalidFormat: string;
        /** @type {Locale} */
        default: string;
        validate: (/** @type {string} */ str: string) => string | true;
    };
    static icon: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<Language> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<Language> | Record<string, any>, options?: import('@nan0web/types').ModelOptions);
}
