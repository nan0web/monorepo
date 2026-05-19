export default Attachment;
declare class Attachment {
    /**
     * @param {object} input
     * @returns {Attachment}
     */
    static from(input: object): Attachment;
    /**
     * @param {object} input
     * @param {string} [input.filename]
     * @param {string} [input.content]
     * @param {string} [input.path]
     * @param {string} [input.href]
     * @param {string} [input.httpHeaders]
     * @param {string} [input.contentType]
     * @param {string} [input.contentDisposition]
     * @param {string} [input.cid]
     * @param {string} [input.encoding]
     * @param {string} [input.headers]
     * @param {string} [input.raw]
     */
    constructor(input?: {
        filename?: string | undefined;
        content?: string | undefined;
        path?: string | undefined;
        href?: string | undefined;
        httpHeaders?: string | undefined;
        contentType?: string | undefined;
        contentDisposition?: string | undefined;
        cid?: string | undefined;
        encoding?: string | undefined;
        headers?: string | undefined;
        raw?: string | undefined;
    });
    /** @type {string} */
    filename: string;
    /** @type {string} */
    content: string;
    /** @type {string} */
    path: string;
    /** @type {string} */
    href: string;
    /** @type {string} */
    httpHeaders: string;
    /** @type {string} */
    contentType: string;
    /** @type {string} */
    contentDisposition: string;
    /** @type {string} */
    cid: string;
    /** @type {string} */
    encoding: string;
    /** @type {string} */
    headers: string;
    /** @type {string} */
    raw: string;
    /**
     * Returns the attachment formatted for nodemailer.
     * @param {object} replacements
     * @param {Function} replacer
     * @returns {object} - The formatted attachment for nodemailer.
     */
    formatForNodemailer(replacements?: object, replacer?: Function): object;
}
