/**
 * Domain model describing the input payload for LanguageIntent analysis.
 * This class establishes the shape and type, strictly separate from CLI concerns or message parsing.
 *
 * In One Logic — Many UI architecture, this model drives both validation and defaults.
 */
export class LanguageIntentModel {
    static lang: {
        alias: string;
        help: string;
        defaultValue: string;
    };
    static inputFile: {
        alias: string;
        help: string;
        defaultValue: string;
    };
    static input: {
        help: string;
        defaultValue: string;
    };
    static outputFile: {
        alias: string;
        help: string;
        defaultValue: string;
    };
    static raw: {
        alias: string;
        help: string;
        defaultValue: boolean;
    };
    static mode: {
        alias: string;
        help: string;
        options: string[];
        defaultValue: string;
    };
    /**
     * @param {Object} input
     */
    constructor(input?: any);
    /** @type {string} */
    lang: string;
    /** @type {string} */
    inputFile: string;
    /** @type {string} */
    input: string;
    /** @type {string} */
    outputFile: string;
    /** @type {boolean} */
    raw: boolean;
    /** @type {string} */
    mode: string;
}
