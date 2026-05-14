export default ReleaseDocument;
declare class ReleaseDocument extends Markdown {
    /**
     * @param {*} input
     * @returns {ReleaseDocument}
     */
    static from(input: any): ReleaseDocument;
    /**
     * @param {Object} options
     * @param {Array} [options.team] - Release team members
     * @param {Map | Array} [options.roles] - Release roles map with team members
     * @param {string} [options.version] - Release version
     * @param {string} [options.date] - Release date
     */
    constructor(options?: {
        team?: any[] | undefined;
        roles?: any[] | Map<any, any> | undefined;
        version?: string | undefined;
        date?: string | undefined;
    });
    /** @type {Person[]} */
    team: Person[];
    /** @type {Map<string, Person[]>} */
    roles: Map<string, Person[]>;
    /** @type {string} */
    version: string;
    /** @type {Date | undefined} */
    date: Date | undefined;
}
import Markdown from '@nan0web/markdown';
import Person from './Person.js';
