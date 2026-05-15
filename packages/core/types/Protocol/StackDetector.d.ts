export class StackDetector {
    /**
     * Detects the platform of the project at the given directory.
     * @param {import('@nan0web/db').default} db
     * @param {string} dir
     * @returns {Promise<'js' | 'python' | 'unknown'>}
     */
    static detectPlatform(db: import("@nan0web/db").default, dir: string): Promise<"js" | "python" | "unknown">;
}
