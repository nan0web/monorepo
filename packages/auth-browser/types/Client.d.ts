export default AuthClient;
/**
 * Authentication client for browser environments
 * Automatically detects current window location for base URL
 */
declare class AuthClient extends AuthDB {
    static DEFAULT_HOST: string;
    static DEFAULT_ROOT: string;
    static DEFAULT_TIMEOUT: number;
    /**
     * Creates and initializes an AuthClient instance
     * @param {object} options - Client configuration options
     * @returns {Promise<AuthClient>} Initialized AuthClient instance
     */
    static create(options?: object): Promise<AuthClient>;
    /**
     * Creates a new AuthClient instance
     * @param {object} options - Client configuration options
     * @param {string} [options.cwd] - Current working directory/base URL
     * @param {string} [options.root] - Root path for document operations
     * @param {number} [options.timeout] - Request timeout in milliseconds
     * @param {Function} [options.fetchFn] - Custom fetch function
     */
    constructor(options?: {
        cwd?: string | undefined;
        root?: string | undefined;
        timeout?: number | undefined;
        fetchFn?: Function | undefined;
    });
}
import AuthDB from './AuthDB.js';
