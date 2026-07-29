/**
 * @file Server-Side Rendering (SSR) & HTTP/HTTPS Server for NaN0Web App Engine.
 * Built on top of @nan0web/http-node. Supports TLS via config.ssl.
 */
export class SSRServer {
    /**
     * @param {import('../runner.js').AppRunner} runner
     */
    constructor(runner: import("../runner.js").AppRunner);
    runner: import("../runner.js").AppRunner;
    bridge: WebSocketBridge;
    /** @type {object | undefined} */
    sslOptions: object | undefined;
    app: import("@nan0web/http-node").Server;
    /**
     * Start the HTTP/HTTPS server.
     * @param {number} [port=3000]
     * @returns {Promise<{ port: number, protocol: string }>}
     */
    listen(port?: number): Promise<{
        port: number;
        protocol: string;
    }>;
    /**
     * Stop the server and bridge.
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Export all registered paths as static HTML files to outDir (SSG).
     * @param {string} outDir
     */
    exportStatic(outDir?: string): Promise<{
        count: number;
        total: number;
    }>;
    #private;
}
export default SSRServer;
import { WebSocketBridge } from '../bridge/WebSocketBridge.js';
