export default Email;
declare class Email {
    /**
     * Creates or returns the same Email if input is such instance.
     * @param {object} input
     * @returns {Email}
     */
    static from(input: object): Email;
    /**
     * @param {object} input
     * @param {string} [input.subject]
     * @param {string} [input.html]
     * @param {object} [input.fields]
     * @param {string} [input.from]
     * @param {string} [input.target]
     * @param {string} [input.to]
     * @param {string} [input.style]
     * @param {string|null} [input.dir]
     * @param {array} [input.attachments]
     * @param {string} [input.text] - Optional plain‑text version of the e‑mail.
     */
    constructor(input?: {
        subject?: string | undefined;
        html?: string | undefined;
        fields?: object;
        from?: string | undefined;
        target?: string | undefined;
        to?: string | undefined;
        style?: string | undefined;
        dir?: string | null | undefined;
        attachments?: any[] | undefined;
        text?: string | undefined;
    });
    /** @type {string} */
    subject: string;
    /** @type {string} */
    html: string;
    /** @type {object} */
    fields: object;
    /** @type {Address} */
    from: Address;
    /** @type {Target} */
    target: Target;
    /** @type {string} */
    style: string;
    /** @type {string|null} */
    dir: string | null;
    /** @type {array} */
    attachments: any[];
    /** @type {string} */
    text: string;
    /**
     * Adds an attachment to the email.
     * @param {Attachment|Array<Attachment>} attachment - The attachment object.
     */
    attach(attachment: Attachment | Array<Attachment>): void;
    /**
     * Formats the email object for nodemailer.
     * @returns {object} - The formatted object for nodemailer.
     */
    formatForNodemailer(replacements?: {}, replacer?: typeof replace): object;
    #private;
}
import Address from './Address.js';
import Target from './Target.js';
import Attachment from './Attachment.js';
import { replace } from './placeholders.js';
