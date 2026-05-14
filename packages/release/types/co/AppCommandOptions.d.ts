export default class AppCommandOptions {
    /**
     * @param {Object} input
     */
    constructor(input?: any);
    /** @type {boolean} */
    webui: boolean;
    /** @type {boolean} */
    json: boolean;
    /** @type {boolean} */
    quiet: boolean;
    /** @type {string} */
    releaseDir: string;
    /** @type {boolean} */
    write: boolean;
    /** @type {string} */
    user: string;
    /** @type {boolean} */
    ignoreFailTests: boolean;
    /** @type {boolean} */
    full: boolean;
}
