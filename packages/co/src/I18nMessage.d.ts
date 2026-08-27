import Message from './Message.js';
export type TranslateFunction = (key: string, params?: Record<string, any>) => string;
/**
 * @typedef {(key:string, params?:Record<string,any>)=>string} TranslateFunction
 *
 * Internationalized Message class.
 *
 * Extends {@link Message} with a translation method `t`.
 *
 * @class I18nMessage
 * @extends Message
 */
export default class I18nMessage extends Message {
    #private;
    /**
     * Default replacer function for translation parameters.
     *
     * Replaces placeholders like `{{name}}` with values from *params*.
     *
     * @static
     * @param {string} key - Translation key containing placeholders.
     * @param {Record<string, any>} [params={}] - Parameters to replace.
     * @returns {string} Translated string.
     */
    static Replacer: (key: string, params?: Record<string, any>) => string;
    /**
     * Create a new I18nMessage instance.
     *
     * @param {object} input - Input configuration.
     * @param {any} [input.body] - Message body.
     * @param {Date|number} [input.time] - Timestamp.
     * @param {TranslateFunction} [input.t] - Custom translation function.
     */
    constructor(input?: {
        body?: any;
        time?: Date | number;
        t?: TranslateFunction;
    });
    /**
     * Translate a key with optional parameters.
     *
     * @param {string} key - Translation key.
     * @param {Record<string, any>} [params] - Parameters for placeholders.
     * @returns {string} Translated string.
     */
    t(key: string, params?: Record<string, any>): string;
    /**
     * Create an I18nMessage from various inputs.
     *
     * @param {any} input - Input value.
     * @returns {I18nMessage}
     */
    static from(input: any): I18nMessage;
}
