/**
 * @typedef {Object} ConfirmSignUpBody
 * @property {string} contact - Email or phone number
 * @property {string} code - Confirmation code
 */
/**
 * ConfirmSignUpMessage - model for registration confirmation
 *
 * Includes semantics for registration confirmation:
 * - Which fields to use
 * - How to validate data
 * - What helper texts to show
 */
export default class ConfirmSignUpMessage extends InputMessage {
    static name: string;
    /**
     * Creates an instance from input
     * @param {any} input - Input data
     * @return {ConfirmSignUpMessage}
     */
    static from(input: any): ConfirmSignUpMessage;
    constructor(input?: {});
    /** @type {ConfirmSignUpBody} */
    body: ConfirmSignUpBody;
    /**
     * Returns errors for each field
     * @returns {Array<string|Array<string,Object>>}
     */
    get errors(): Array<string | Array<string, any>>;
    get contactLabel(): string;
    get contactHelp(): string;
    get contactPlaceholder(): string;
    get codeLabel(): string;
    get codeHelp(): string;
    get codePlaceholder(): string;
    get codeMinLength(): number;
}
export type ConfirmSignUpBody = {
    /**
     * - Email or phone number
     */
    contact: string;
    /**
     * - Confirmation code
     */
    code: string;
};
import { InputMessage } from '@nan0web/types';
