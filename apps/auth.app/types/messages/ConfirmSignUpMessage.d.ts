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
export default class ConfirmSignUpMessage extends ModelInputMessage {
    static alias: string;
    static contact: {
        help: string;
        type: string;
        required: boolean;
        default: string;
        validate: (v: any) => true | "Contact is required";
    };
    static code: {
        help: string;
        type: string;
        required: boolean;
        default: string;
        validate: (v: any) => any;
    };
    /** @type {string} */ contact: string;
    /** @type {string} */ code: string;
    get contactLabel(): string;
    get contactHelp(): any;
    get contactPlaceholder(): string;
    get codeLabel(): string;
    get codeHelp(): any;
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
import ModelInputMessage from './ModelInputMessage.js';
