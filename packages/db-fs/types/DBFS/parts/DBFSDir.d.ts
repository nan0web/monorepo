/**
 * Directory and locale management layer for filesystem database.
 * Handles directory listing, stats mapping and auto-detection of locales.
 *
 * @class
 * @extends {DBFSDoc}
 */
export default class DBFSDir extends DBFSDoc {
    /**
     * Creates a DocumentStat instance from fs.Stats.
     * @param {import("node:fs").Stats} stats The fs.Stats object.
     * @returns {DocumentStat} A new DocumentStat instance.
     */
    static createDocumentStatFrom(stats: import("node:fs").Stats): DocumentStat;
    /**
     * Lists the contents of a directory.
     * @param {string} uri The directory URI to list.
     * @param {{depth?: number, skipStat?: boolean}} [options={}] Options for listing.
     * @returns {Promise<DocumentEntry[]>} The list of directory entries.
     */
    listDir(uri: string, { depth, skipStat }?: {
        depth?: number;
        skipStat?: boolean;
    }): Promise<DocumentEntry[]>;
    /**
     * Detects auto-locales based on first level directory names.
     * Matches against built-in Intl language list.
     * @returns {Promise<{locale: string, title: string, dir: string}[]>}
     */
    detectLocales(): Promise<{
        locale: string;
        title: string;
        dir: string;
    }[]>;
}
import DBFSDoc from './DBFSDoc.js';
import { DocumentEntry } from '@nan0web/db';
import { DocumentStat } from '@nan0web/db';
