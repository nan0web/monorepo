export default class Password {
    /**
     * Hash a plaintext password using scrypt.
     *
     * @param {string} plain - plaintext password
     * @param {string} [projectSalt=''] - optional project-level salt prefix
     * @returns {string} - "salt_hex:hash_hex" format
     */
    static hash(plain: string, projectSalt?: string): string;
    /**
     * Verify a password against a stored hash.
     *
     * Supports two formats:
     *   1. scrypt hash — "salt_hex:hash_hex" (production)
     *   2. plain string — direct comparison (dev/migration fallback)
     *
     * @param {string} input - user-provided password
     * @param {string} stored - stored hash or plain string
     * @param {string} [projectSalt=''] - same salt used during hash()
     * @returns {boolean}
     */
    static verify(input: string, stored: string, projectSalt?: string): boolean;
}
