export default AuthDB;
/**
 * @goal
 * # Auth Database
 * Provides authentication-specific functionality on top of DataDB.
 *
 * AuthDB extends DataDB to provide standard authentication functions like
 * registration, sign-in, sign-out, password reset, and third-party auth.
 *
 * ## Requirements
 * - Every function and property must be jsdoc'ed with type (at least);
 * - Every public function must be tested;
 * - Every known vulnerability must be included in test;
 */
declare class AuthDB extends BrowserDB {
    static PUBLIC_DIRS: string[];
    /**
     * @param {object} [input]
     * @param {string} [input.root='/'] - Root path for document operations
     * @param {string} [input.cwd] - Base URL (host)
     * @param {string} [input.token=''] - Initial auth token
     * @param {string} [input.extension='.json']
     * @param {string} [input.indexFile='index.json']
     * @param {string} [input.localIndexFile='index.d.json']
     * @param {number} [input.timeout=6_000] - Request timeout in milliseconds
     * @param {Function} [input.fetchFn] - Custom fetch function
     * @param {number} [input.tokenLifetime=3_600_000] - Token lifetime in milliseconds
     */
    constructor(input?: {
        root?: string | undefined;
        cwd?: string | undefined;
        token?: string | undefined;
        extension?: string | undefined;
        indexFile?: string | undefined;
        localIndexFile?: string | undefined;
        timeout?: number | undefined;
        fetchFn?: Function | undefined;
        tokenLifetime?: number | undefined;
    });
    /** @type {string} */
    token: string;
    /** @type {TokenExpiryService} */
    tokenExpiryService: TokenExpiryService;
    /**
     * Fetches a document with authentication headers if available
     * @param {string} uri - The URI to fetch
     * @param {object} [requestInit={}] - Fetch request initialization options
     * @returns {Promise<any>} Fetch response
     */
    fetch(uri: string, requestInit?: object): Promise<any>;
    /**
     * Register a new user account
     * @param {object} input - Registration data
     * @param {string} input.username - Username for new account
     * @param {string} input.password - Password for new account
     * @returns {Promise<object>} Registration response
     */
    register(input: {
        username: string;
        password: string;
    }): Promise<object>;
    /**
     * Confirm user registration with verification code
     * @param {string} username - Username to confirm
     * @param {string} code - Verification code
     * @returns {Promise<object>} Confirmation response with token
     */
    confirmRegistration(username: string, code: string): Promise<object>;
    /**
     * Delete a user account
     * @param {string} username - Username of account to delete
     * @returns {Promise<boolean>} Success status
     */
    deleteAccount(username: string): Promise<boolean>;
    /**
     * Sign in a user with username and password
     * @throws {HTTPError}
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @param {object} [context={}] - Additional context for sign in
     * @returns {Promise<{token: string} | {error: object}>} Object with token on success and with error on failure.
     */
    signIn(username: string, password: string, context?: object): Promise<{
        token: string;
    } | {
        error: object;
    }>;
    me: string | undefined;
    /**
     * Get user data
     * @throws {HTTPError}
     * @param {string} username - Username to retrieve
     * @returns {Promise<User>} User object
     */
    getUser(username: string): Promise<User>;
    /**
     * Get user information
     * @throws {HTTPError}
     * @param {string} username - Username to retrieve info for
     * @returns {Promise<User>} User object with info
     */
    getUserInfo(username: string): Promise<User>;
    /**
     * List all users
     * @throws {HTTPError}
     * @returns {Promise<string[]>} Array of usernames
     */
    listUsers(): Promise<string[]>;
    /**
     * Refresh authentication token
     * @param {string} [token] - Token to refresh (defaults to current token)
     * @param {boolean} [replace=false] - Whether to replace current token
     * @returns {Promise<object>} Refresh response
     */
    refreshToken(token?: string, replace?: boolean): Promise<object>;
    /**
     * Initiate password reset process
     * @param {string} username - Username for password reset
     * @returns {Promise<object>} Password reset response
     */
    forgotPassword(username: string): Promise<object>;
    /**
     * Reset user password with verification code
     * @param {string} username - Username
     * @param {string} code - Verification code
     * @param {string} password - New password
     * @returns {Promise<object>} Reset response with new token
     */
    resetPassword(username: string, code: string, password: string): Promise<object>;
    /**
     * Sign out current user
     * @param {string} username - Username to sign out
     * @returns {Promise<boolean>} Success status
     */
    signOut(username: string): Promise<boolean>;
    /**
     * Authenticate with third-party provider
     * @param {string} provider - Provider name (e.g., 'google', 'github')
     * @param {string} token - Provider authentication token
     * @returns {Promise<object>} Authentication response with token
     */
    authWithProvider(provider: string, token: string): Promise<object>;
}
import { BrowserDB } from '@nan0web/db-browser';
import { TokenExpiryService } from '@nan0web/auth-core';
import { User } from '@nan0web/auth-core';
