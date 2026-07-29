/**
 * Checks whether external CLI tools are available and reports missing ones
 * with install instructions.
 */
export class ToolChecker {
    /**
     * @param {string} tool - Binary name to check (e.g. 'ffmpeg', 'yt-dlp')
     * @returns {Promise<boolean>}
     */
    static check(tool: string): Promise<boolean>;
    /**
     * Checks multiple tools and returns a list of missing ones.
     *
     * @param {Record<string, string>} tools - Map of binary name → install hint
     * @returns {Promise<{ tool: string, hint: string }[]>}
     */
    static require(tools: Record<string, string>): Promise<{
        tool: string;
        hint: string;
    }[]>;
}
