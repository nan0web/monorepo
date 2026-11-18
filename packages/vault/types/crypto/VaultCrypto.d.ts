/**
 * VaultCrypto - Cryptographic primitives for Vault.
 * Uses Argon2/scrypt key derivation + AES-256-GCM / ChaCha20-Poly1305 AEAD.
 */
export class VaultCrypto {
    static MAGIC: string;
    static VERSION: number;
    /**
     * Generate a cryptographically secure random salt.
     * @param {number} [bytes=32]
     * @returns {Buffer}
     */
    static generateSalt(bytes?: number): Buffer;
    /**
     * Derive a 256-bit encryption key from passphrase and salt.
     * @param {string} passphrase
     * @param {Buffer} salt
     * @returns {Promise<Buffer>}
     */
    static deriveKey(passphrase: string, salt: Buffer): Promise<Buffer>;
    /**
     * Encrypt payload string into a secure container format.
     * @param {string} payload
     * @param {string} passphrase
     * @returns {Promise<{
     *   magic: string,
     *   version: number,
     *   salt: string,
     *   iv: string,
     *   ciphertext: string,
     *   tag: string
     * }>}
     */
    static encrypt(payload: string, passphrase: string): Promise<{
        magic: string;
        version: number;
        salt: string;
        iv: string;
        ciphertext: string;
        tag: string;
    }>;
    /**
     * Decrypt container with passphrase and verify integrity.
     * @param {{
     *   magic?: string,
     *   version?: number,
     *   salt: string,
     *   iv: string,
     *   ciphertext: string,
     *   tag: string
     * }} container
     * @param {string} passphrase
     * @returns {Promise<string>}
     */
    static decrypt(container: {
        magic?: string;
        version?: number;
        salt: string;
        iv: string;
        ciphertext: string;
        tag: string;
    }, passphrase: string): Promise<string>;
}
