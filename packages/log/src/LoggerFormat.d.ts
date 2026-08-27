declare class LoggerFormat {
    /** @type {string} */
    icon: string;
    /** @type {string} */
    color: string;
    /** @type {string} */
    bgColor: string;
    constructor(input?: {});
    /**
     * @param {object} input
     * @returns {LoggerFormat}
     */
    static from(input: object): LoggerFormat;
}
export default LoggerFormat;
