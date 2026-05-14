/**
 * @typedef {Object} AuthorizedHead
 * @property {string} authorization - Authorization token
 */
/**
 * Message for authorized requests
 * Contains authorization header information
 */
export default class AuthorizedMessage extends I18nMessage {
    /**
     * Creates an instance from input
     * @param {any} input - Input data
     * @return {AuthorizedMessage}
     */
    static from(input: any): AuthorizedMessage;
    constructor(input?: {});
    /** @type {AuthorizedHead} */
    head: AuthorizedHead;
}
export type AuthorizedHead = {
    /**
     * - Authorization token
     */
    authorization: string;
};
import { I18nMessage } from '@nan0web/types';
