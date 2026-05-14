/**
 * @module Token
 * @description Sovereign JWT-compatible token built on Ed25519.
 *
 * Zero-dependency, compact, stateless authentication primitive.
 * Format: base64url(header).base64url(payload).base64url(signature)
 *
 * @example
 * const { publicKey, privateKey } = Crypto.generateKeyPair()
 * const token = Token.create({ sub: 'user@yaro.page' }, privateKey, { expiresIn: 3600 })
 * const result = Token.verify(token, publicKey)
 * // { valid: true, payload: { sub: 'user@yaro.page', iat: ..., exp: ... } }
 */
export default class Token {
    /**
     * Create a signed JWT-compatible token.
     *
     * @param {Record<string, unknown>} payload - Claims (sub, iss, custom, etc.)
     * @param {string} privateKeyB64 - Base64-encoded Ed25519 PKCS8 DER private key
     * @param {{ expiresIn?: number }} [options] - Options. expiresIn = seconds until expiry.
     * @returns {string} Signed token (header.payload.signature)
     */
    static create(payload: Record<string, unknown>, privateKeyB64: string, options?: {
        expiresIn?: number;
    }): string;
    /**
     * Verify a token's signature and expiry.
     *
     * @param {string} token - The signed token string
     * @param {string} publicKeyB64 - Base64-encoded Ed25519 SPKI DER public key
     * @returns {{ valid: boolean, payload?: Record<string, unknown>, error?: string }}
     */
    static verify(token: string, publicKeyB64: string): {
        valid: boolean;
        payload?: Record<string, unknown>;
        error?: string;
    };
    /**
     * Decode a token's payload without verifying signature.
     *
     * @param {string} token - The token string
     * @returns {Record<string, unknown> | null} Decoded payload or null if malformed
     */
    static decode(token: string): Record<string, unknown> | null;
    /**
     * Refresh a token — creates a new token with the same claims but updated iat/exp.
     *
     * @param {string} token - Original signed token
     * @param {string} privateKeyB64 - Private key for re-signing
     * @param {{ expiresIn?: number }} [options] - New expiry options
     * @returns {string} New signed token
     */
    static refresh(token: string, privateKeyB64: string, options?: {
        expiresIn?: number;
    }): string;
    /**
     * @param {string} str
     * @returns {string}
     */
    static "__#private@#toBase64Url"(str: string): string;
    /**
     * @param {string} b64
     * @returns {string}
     */
    static "__#private@#b64ToB64Url"(b64: string): string;
    /**
     * @param {string} b64url
     * @returns {string}
     */
    static "__#private@#b64UrlToB64"(b64url: string): string;
}
