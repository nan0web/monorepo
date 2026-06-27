/**
 * @typedef {Object} ParseResult
 * @property {boolean} isValid
 * @property {string=} error
 * @property {Array<import("../domain/app/ChatSessionModel.js").Attachment>} files
 */
/**
 * StrictBoundaryInterpreter - parses assistant output in strict boundary format
 * and checks for illegal markdown code blocks.
 */
export class StrictBoundaryInterpreter {
    /**
     * Parse response content
     * @param {string} source
     * @returns {ParseResult}
     */
    static parse(source: string): ParseResult;
}
export type ParseResult = {
    isValid: boolean;
    error?: string | undefined;
    files: Array<import("../domain/app/ChatSessionModel.js").Attachment>;
};
