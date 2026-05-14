export class AuthDB {
    static TOKEN_LIFETIME: number;
    constructor(input?: {});
    /** @type {Map<string, {time: Date, username: string, isRefresh: boolean}>} */
    tokens: Map<string, {
        time: Date;
        username: string;
        isRefresh: boolean;
    }>;
    /** @type {Console} */
    logger: Console;
    /** @type {TokenExpiryService} */
    tokenExpiryService: TokenExpiryService;
    /** @type {TokenManager} */
    tokenManager: TokenManager;
    /** @type {DB} */
    db: DB;
    get meta(): Map<string, import("@nan0web/db").DocumentStat>;
    get data(): Map<string, any>;
    load(): Promise<void>;
    getUserPath(username: any, suffix?: string): string;
    loadDocument(path: any, defaultValue: any): Promise<any>;
    saveDocument(path: any, data: any): Promise<boolean>;
    /**
     * @param {string} token
     * @returns {Promise<User | null>} The user instance.
     */
    auth(token: string): Promise<User | null>;
    updateTokens(username: any, tokenPair: any): Promise<void>;
    deleteToken(token: any): Promise<boolean>;
    /**
     * @param {string} username
     * @returns {Promise<boolean>} True on success, false on failure.
     */
    clearTokens(username: string): Promise<boolean>;
    /**
     * @throws
     * @param {string} username
     * @returns {Promise<User | null>}
     */
    getUser(username: string): Promise<User | null>;
    /**
     * @param {string} email
     * @returns {Promise<User | null>}
     */
    getUserByEmail(email: string): Promise<User | null>;
    /**
     * Finds user by username or email
     * @param {string} identifier - Username or email
     * @returns {Promise<User | null>}
     */
    findUser(identifier: string): Promise<User | null>;
    /**
     * @param {User} user
     * @returns {Promise<boolean>}
     */
    saveUser(user: User): Promise<boolean>;
    deleteUser(username: any): Promise<void>;
    /**
     * Lists all users with pagination and optional search
     * @param {Object} [options]
     * @param {number} [options.page=1] - Page number (1-based)
     * @param {string} [options.search=''] - Search filter (name or email)
     * @param {number} [options.limit=10] - Items per page
     * @returns {Promise<{ items: Object[], total: number, page: number, pages: number }>}
     */
    listUsers({ page, search, limit }?: {
        page?: number | undefined;
        search?: string | undefined;
        limit?: number | undefined;
    }): Promise<{
        items: any[];
        total: number;
        page: number;
        pages: number;
    }>;
}
export default AuthDB;
import { TokenExpiryService } from '@nan0web/auth-core';
import TokenManager from './TokenManager.js';
import { DB } from '@nan0web/db';
import { User } from '@nan0web/auth-core';
