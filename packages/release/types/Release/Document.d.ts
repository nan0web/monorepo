import Markdown, { MDElement } from '@nan0web/markdown';
import Person from './Person.js';
declare class ReleaseDocument extends Markdown {
    /** @type {Person[]} */
    team: Person[];
    /** @type {Map<string, Person[]>} */
    roles: Map<string, Person[]>;
    /** @type {string} */
    version: string;
    /** @type {Date | undefined} */
    date: Date | undefined;
    /**
     * @param {Object} options
     * @param {Array} [options.team] - Release team members
     * @param {Map | Array} [options.roles] - Release roles map with team members
     * @param {string} [options.version] - Release version
     * @param {string} [options.date] - Release date
     */
    constructor(options?: {
        team?: any[];
        roles?: Map<any, any> | any[];
        version?: string;
        date?: string;
    });
    /**
     * Parse release document content
     * Extracts version and date from H1 heading
     * @param {string} input - Markdown content
     * @returns {MDElement[]}
     */
    parse(input: string): MDElement[];
    /**
     * @param {*} input
     * @returns {ReleaseDocument}
     */
    static from(input: any): ReleaseDocument;
}
export default ReleaseDocument;
