/**
 * @typedef {Object} RegistrationBody
 * @property {string} username - Username
 * @property {string} password - Password
 */
/**
 * RegistrationMessage - model for user registration requests
 * Validates username and password requirements
 */
export default class RegistrationMessage extends I18nMessage {
    /**
     * Creates an instance from input
     * @param {any} input - Input data
     * @return {RegistrationMessage}
     */
    static from(input: any): RegistrationMessage;
    constructor(input?: {});
    /** @type {RegistrationBody} */
    body: RegistrationBody;
    get usernameHelp(): string;
    get passwordHelp(): string;
    /**
     * Validates username format
     * @returns {boolean}
     */
    get isUsernameValid(): boolean;
    /**
     * Validates password format
     * @returns {boolean}
     */
    get isPasswordValid(): boolean;
    /**
     * Checks if username is required
     * @returns {boolean}
     */
    get isUsernameRequired(): boolean;
    /**
     * Checks if password is required
     * @returns {boolean}
     */
    get isPasswordRequired(): boolean;
    /**
     * Validates message and returns errors for every field
     * @returns {Array<string|Array<string,Object>>}
     */
    get errors(): Array<string | Array<string, any>>;
}
export type RegistrationBody = {
    /**
     * - Username
     */
    username: string;
    /**
     * - Password
     */
    password: string;
};
import { I18nMessage } from '@nan0web/types';
