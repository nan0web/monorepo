/**
 * Handles locale-specific formatting for different data types.
 */
export default class Locale {
    /**
     * @param {any} input
     * @returns {Locale}
     */
    static from(input: any): Locale;
    /**
     * Creates a new Locale instance.
     * @param {object} props - Locale properties or all locale string
     * @param {string} [props.lang=""] - Language locale
     * @param {string} [props.collate=""] - Collation locale
     * @param {string} [props.ctype=""] - Character type locale
     * @param {string} [props.messages=""] - Messages locale
     * @param {string} [props.monetary=""] - Monetary locale
     * @param {string} [props.numeric=""] - Numeric locale
     * @param {string} [props.time=""] - Time locale
     * @param {string} [props.all="uk_UA.UTF-8"] - General locale fallback
     */
    constructor(props?: {
        lang?: string | undefined;
        collate?: string | undefined;
        ctype?: string | undefined;
        messages?: string | undefined;
        monetary?: string | undefined;
        numeric?: string | undefined;
        time?: string | undefined;
        all?: string | undefined;
    });
    /** @type {string} Language locale */
    lang: string;
    /** @type {string} Collation locale */
    collate: string;
    /** @type {string} Character type locale */
    ctype: string;
    /** @type {string} Messages locale */
    messages: string;
    /** @type {string} Monetary locale */
    monetary: string;
    /** @type {string} Numeric locale */
    numeric: string;
    /** @type {string} Time locale */
    time: string;
    /** @type {string} General locale fallback */
    all: string;
    /**
     * Formats values according to locale settings.
     * @param {Function} type - Type constructor (Number, String, etc.)
     * @param {object} options - Formatting options
     * @returns {Function|null} Formatting function or null if unsupported type
     */
    format(type: Function, options: object): Function | null;
}
