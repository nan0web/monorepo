/**
 * @typedef {Object} OSExecutorOptions
 * @property {string} [cwd] Current working directory
 */
/**
 * OSExecutor class that implements the OS-adapter contract for llimo.v3
 */
export class OSExecutor {
    /**
     * @param {OSExecutorOptions} [options]
     */
    constructor(options?: OSExecutorOptions);
    cwd: string;
    /**
     * Execute a shell command securely and return output
     * @param {string} command
     * @param {Object} [options]
     * @param {number} [options.timeout] timeout in ms
     * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
     */
    executeCommand(command: string, options?: {
        timeout?: number | undefined;
    }): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Check if file or directory exists
     * @param {string} filePath
     * @returns {Promise<boolean>}
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Read file content
     * @param {string} filePath
     * @param {BufferEncoding} [encoding='utf8']
     * @returns {Promise<string>}
     */
    readFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
    /**
     * Write file content
     * @param {string} filePath
     * @param {string} content
     * @returns {Promise<void>}
     */
    writeFile(filePath: string, content: string): Promise<void>;
    /**
     * Detect project platform (js, python, unknown)
     * @param {any} db - @nan0web/db instance
     * @param {string} dir
     * @returns {Promise<'js' | 'python' | 'unknown'>}
     */
    detectPlatform(db: any, dir: string): Promise<"js" | "python" | "unknown">;
}
export type OSExecutorOptions = {
    /**
     * Current working directory
     */
    cwd?: string | undefined;
};
