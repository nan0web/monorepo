export default TokenExpiryService;
/**
 * TokenExpiryService handles token lifetime validation and management
 * Provides utilities for checking token validity, calculating expiry dates,
 * and managing refresh policies.
 */
declare class TokenExpiryService {
    /**
     * Create a TokenExpiryService instance from input
     * @param {number|TokenExpiryService} input - Lifetime in ms or existing instance
     * @returns {TokenExpiryService} TokenExpiryService instance
     */
    static from(input: number | TokenExpiryService): TokenExpiryService;
    /**
     * Create a new TokenExpiryService instance
     * @param {number} defaultLifetime - Default token lifetime in milliseconds
     */
    constructor(defaultLifetime?: number);
    toString(): string;
    /**
     * Check if a token is still valid based on its creation time
     * @param {Date} tokenCreationTime - When the token was created
     * @param {number} [lifetime=this.#defaultLifetime] - Token lifetime in milliseconds
     * @returns {boolean} True if token is still valid, false otherwise
     */
    isValid(tokenCreationTime: Date, lifetime?: number): boolean;
    /**
     * Calculate token expiry date
     * @param {Date} [issuedAt=new Date()] - Token issue date
     * @param {number} [lifetime=this.#defaultLifetime] - Token lifetime in milliseconds
     * @returns {Date} Expiry date
     */
    getExpiryDate(issuedAt?: Date, lifetime?: number): Date;
    /**
     * Extend token lifetime by specified milliseconds
     * @param {Date} tokenCreationTime - When the token was created
     * @param {number} [extensionMs=0] - Extension in milliseconds
     * @param {number} [maxLifetime=this.#defaultLifetime] - Maximum lifetime allowed
     * @returns {number} Extended lifetime in milliseconds
     */
    extendLifetime(tokenCreationTime: Date, extensionMs?: number, maxLifetime?: number): number;
    #private;
}
