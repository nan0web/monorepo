export default User;
/**
 * Interface for user configuration options
 */
export type UserInput = {
    name?: string | undefined;
    email?: string | undefined;
    passwordHash?: string | undefined;
    verified?: boolean | undefined;
    verificationCode?: string | null | undefined;
    resetCode?: string | null | undefined;
    resetCodeAt?: string | null | undefined;
    roles?: string | string[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    tokens?: Map<string, Date> | undefined;
    tokenExpiryService?: TokenExpiryService | undefined;
};
/**
 * Interface for user configuration options
 * @typedef {Object} UserInput
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [passwordHash]
 * @property {boolean} [verified]
 * @property {string | null} [verificationCode]
 * @property {string | null} [resetCode]
 * @property {string | null} [resetCodeAt]
 * @property {string | string[]} [roles]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {Map<string, Date>} [tokens]
 * @property {TokenExpiryService} [tokenExpiryService]
 */
/**
 * Represents a user in the authentication system
 */
declare class User {
    static TOKEN_LIFETIME: number;
    static TokenExpiryService: typeof TokenExpiryService;
    static Role: typeof Role;
    /**
     * Creates a new User instance from a raw object
     * @param {object} input - Raw user data
     * @returns {User} - User instance
     */
    static from(input: object): User;
    /**
     * Creates a new User instance
     * @param {UserInput} input - User configuration options
     */
    constructor(input?: UserInput);
    /** @type {string} */
    name: string;
    /** @type {string} */
    email: string;
    /** @type {string} */
    passwordHash: string;
    /** @type {boolean} */
    verified: boolean;
    /** @type {string} */
    verificationCode: string;
    /** @type {string} */
    resetCode: string;
    /** @type {Date | null} */
    resetCodeAt: Date | null;
    /** @type {Role[]} */
    roles: Role[];
    /** @type {Date} */
    createdAt: Date;
    /** @type {Date} */
    updatedAt: Date;
    /** @type {TokenExpiryService} */
    tokenExpiryService: TokenExpiryService;
    /**
     * @returns {typeof TokenExpiryService}
     */
    get TokenExpiryService(): typeof TokenExpiryService;
    /**
     * @returns {typeof Role}
     */
    get Role(): typeof Role;
    /**
     * @param {string | Role} role
     * @returns {boolean} True if roles include the current role, otherwise false.
     */
    is(role: string | Role): boolean;
    /**
     * Converts user data to a plain object
     * @returns {object} - User data as a plain object
     */
    toObject(): object;
    /**
     * @param {string} token
     * @returns {Date | undefined}
     */
    getToken(token: string): Date | undefined;
    /**
     * @returns {Map<string, Date>}
     */
    getTokens(validOnly?: boolean): Map<string, Date>;
    /**
     * Represents object as a string (debugger version).
     * @param {object} [input]
     * @param {boolean} [input.detailed=false]
     * @param {boolean} [input.hideDate=false]
     * @param {boolean} [input.hideRoles=false]
     * @param {string} [input.eol="\n"]
     * @returns {string}
     */
    toString(input?: {
        detailed?: boolean | undefined;
        hideDate?: boolean | undefined;
        hideRoles?: boolean | undefined;
        eol?: string | undefined;
    }): string;
    #private;
}
import TokenExpiryService from './TokenExpiryService.js';
import Role from './Role.js';
