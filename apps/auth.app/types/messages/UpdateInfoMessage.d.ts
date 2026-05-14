/**
 * @typedef {Object} UpdateInfoBody
 * @property {string} username - Username
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {number} gender - Gender identifier
 */
/**
 * UpdateInfoMessage - model for updating user information
 * Extends AuthorizedMessage to include authorization requirements
 */
export default class UpdateInfoMessage extends AuthorizedMessage {
    /**
     * Creates an instance from input
     * @param {any} input - Input data
     * @return {UpdateInfoMessage}
     */
    static from(input: any): UpdateInfoMessage;
    /** @type {UpdateInfoBody} */
    body: UpdateInfoBody;
}
export type UpdateInfoBody = {
    /**
     * - Username
     */
    username: string;
    /**
     * - First name
     */
    firstName: string;
    /**
     * - Last name
     */
    lastName: string;
    /**
     * - Gender identifier
     */
    gender: number;
};
import AuthorizedMessage from './AuthorizedMessage.js';
