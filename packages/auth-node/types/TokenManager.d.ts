export default TokenManager;
/**
 * Manages token creation and validation
 */
declare class TokenManager {
    static ACCESS_TOKEN_LIFETIME: number;
    static REFRESH_TOKEN_LIFETIME: number;
    static from(options: any): TokenManager;
    constructor(options?: {});
    secret: any;
    createTokenPair(username: any): {
        accessToken: string;
        refreshToken: string;
        accessExpiry: Date;
        refreshExpiry: Date;
    };
    getShortHash(value: any): string;
    generateToken(): string;
    isRefreshValid(time: any): boolean;
    isAccessValid(time: any): boolean;
}
