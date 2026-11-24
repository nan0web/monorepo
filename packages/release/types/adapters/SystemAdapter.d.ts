/**
 * SystemAdapter encapsulates OS-level side effects (IDE launch, JXA, HTTP server)
 * so domain models stay pure OLMUI and 100% testable in-memory.
 */
export class SystemAdapter {
    /**
     * @returns {NodeJS.Platform}
     */
    getPlatform(): NodeJS.Platform;
    /**
     * Launch Antigravity IDE for target directory.
     * @param {string} targetDir
     * @param {string} [bin]
     * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
     */
    openIde(targetDir: string, bin?: string): Promise<{
        ok: boolean;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Execute JXA script via osascript on macOS.
     * @param {string} script
     * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
     */
    runJxa(script: string): Promise<{
        ok: boolean;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Start a lightweight Node.js HTTP server.
     * @param {number} port
     * @param {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void} handler
     * @returns {Promise<import('node:http').Server>}
     */
    startHttpServer(port: number, handler: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) => void): Promise<import("node:http").Server>;
}
export default SystemAdapter;
