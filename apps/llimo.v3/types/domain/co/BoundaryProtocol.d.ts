/**
 * @typedef {{ filename: string, content: string, startLine?: number, lineCount?: number }} FileSegment
 *
 * @typedef {Object} DecodeResult
 * @property {boolean} isValid
 * @property {string} [error]
 * @property {Array<FileSegment>} files
 */
export class CommunicationProtocol {
    /**
     * @param {DB} db
     */
    constructor(db: DB);
    db: DB;
    /**
     * @param {string | Markdown} text
     * @returns {Promise<string>}
     */
    encode(text: string | Markdown): Promise<string>;
    /**
     * @param {string} text
     * @returns {DecodeResult}
     */
    decode(text: string): DecodeResult;
}
export class BoundaryProtocol extends CommunicationProtocol {
    /**
     * Validates file content based on extension.
     * @param {string} filename
     * @param {string} content
     * @returns {{ valid: boolean, error?: string }}
     */
    static validateFileContent(filename: string, content: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * @param {DB} db
     * @param {string} [locale='uk']
     */
    constructor(db: DB, locale?: string);
    locale: string;
    /**
     * Resolves a path, wildcard (e.g. src/** or src/*.js), or database/workflow path.
     * @param {string} pathPattern
     * @returns {Promise<Array<{ path: string, isDb: boolean }>>}
     */
    resolvePaths(pathPattern: string): Promise<Array<{
        path: string;
        isDb: boolean;
    }>>;
    /**
     * @param {string} text
     */
    decode(text: string): {
        isValid: boolean;
        error: string;
        files: never[];
    } | {
        isValid: boolean;
        files: {
            filename: string;
            content: string;
            startLine: number | undefined;
            lineCount: number | undefined;
        }[];
        error?: undefined;
    };
}
export type FileSegment = {
    filename: string;
    content: string;
    startLine?: number;
    lineCount?: number;
};
export type DecodeResult = {
    isValid: boolean;
    error?: string | undefined;
    files: Array<FileSegment>;
};
import DB from '@nan0web/db';
import Markdown from '@nan0web/markdown';
