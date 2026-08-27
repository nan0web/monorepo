export default class ParseContext {
    /** @type {number} */
    i: number;
    /** @type {number} */
    j: number;
    /** @type {string[]} */
    rows: string[];
    /** @type {Array} */
    skipped: any[];
    /**
     * @param {object} input
     * @param {number} [input.i=0] The row position
     * @param {number} [input.j=0] The column position
     * @param {string[]} [input.rows] The rows
     * @param {Array} [input.skipped] The skipped rows
     */
    constructor(input?: {
        i?: number;
        j?: number;
        rows?: string[];
        skipped?: any[];
    });
}
