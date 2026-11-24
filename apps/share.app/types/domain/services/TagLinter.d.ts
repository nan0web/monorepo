/**
 * @typedef {object} StreamConfig
 * @property {string} id
 * @property {string} [name]
 * @property {string | string[]} [tags]
 * @property {string} [action]
 * @property {Array<Record<string, any>>} [destinations]
 * @property {string[]} [translate]
 */
/**
 * @typedef {object} UnknownTagReportItem
 * @property {string} tag
 * @property {number} line
 * @property {string} section
 * @property {string} [file]
 */
/**
 * @typedef {object} TagValidationResult
 * @property {boolean} valid
 * @property {UnknownTagReportItem[]} unknownTags
 * @property {string} report
 */
/**
 * TagLinter — validates all document hashtags against configured stream tags.
 * Never fails on the first unknown tag; collects a complete structured report.
 */
export class TagLinter {
    /**
     * Normalizes a space-separated string, array, or Set of tags into a Set of lowercase `#tag` strings.
     * @param {string | string[] | Set<string> | undefined} input
     * @returns {Set<string>}
     */
    static normalizeTags(input: string | string[] | Set<string> | undefined): Set<string>;
    /**
     * Formats a structured error report from a list of unknown tag occurrences.
     * @param {UnknownTagReportItem[]} unknownTags
     * @returns {TagValidationResult}
     */
    static formatReport(unknownTags: UnknownTagReportItem[]): TagValidationResult;
    /**
     * @param {object} [options]
     * @param {StreamConfig[]} [options.streams]
     */
    constructor({ streams }?: {
        streams?: StreamConfig[];
    });
    /** @type {Set<string>} */
    registeredTags: Set<string>;
    /**
     * Validates extracted sections and returns a complete report of all unregistered tags.
     * @param {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
     * @param {string} [file]
     * @returns {TagValidationResult}
     */
    validate(sections: import("./MarkdownAstExtractor.js").ExtractedSection[], file?: string): TagValidationResult;
}
export type StreamConfig = {
    id: string;
    name?: string;
    tags?: string | string[];
    action?: string;
    destinations?: Array<Record<string, any>>;
    translate?: string[];
};
export type UnknownTagReportItem = {
    tag: string;
    line: number;
    section: string;
    file?: string;
};
export type TagValidationResult = {
    valid: boolean;
    unknownTags: UnknownTagReportItem[];
    report: string;
};
