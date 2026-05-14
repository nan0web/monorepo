export default LoggerFormat;
declare class LoggerFormat {
    /**
     * @param {object} input
     * @returns {LoggerFormat}
     */
    static from(input: object): LoggerFormat;
    constructor(input?: {});
    /** @type {string} */
    icon: string;
    /** @type {string} */
    color: string;
    /** @type {string} */
    bgColor: string;
}
