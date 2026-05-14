export default class Session {
    /**
     * @param {string} filepath — absolute path to session.json
     */
    constructor(filepath: string);
    /**
     * Save current user email to disk.
     *
     * @param {string} email — user identifier to persist
     */
    save(email: string): void;
    /**
     * Load saved email from disk.
     *
     * @returns {string|null} — saved email or null if not found / corrupt
     */
    load(): string | null;
    /**
     * Clear session file (write empty object).
     */
    clear(): void;
    #private;
}
