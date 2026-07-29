/**
 * WebSocket Bridge for NaN0Web App.
 * Facilitates real-time state synchronization and intent delegation between server and clients.
 *
 * Protocol:
 * - Server -> Client: { type: 'STATE_UPDATED', payload: state }
 * - Client -> Server: { type: 'RESOLVE_INTENT', payload: { src, url, ui } }
 */
export class WebSocketBridge {
    /**
     * @param {import('../runner.js').AppRunner} runner
     */
    constructor(runner: import("../runner.js").AppRunner);
    runner: import("../runner.js").AppRunner;
    /** @type {Set<import('ws').WebSocket>} */
    clients: Set<import("ws").WebSocket>;
    /** @type {WebSocketServer | null} */
    wss: WebSocketServer | null;
    /**
     * Attach the bridge to an existing HTTP/HTTPS server.
     * @param {import('http').Server | import('https').Server} server
     */
    attach(server: import("http").Server | import("https").Server): void;
    /**
     * Broadcast a message to all connected clients.
     * @param {object} message
     */
    broadcast(message: object): void;
    /**
     * Shutdown the bridge.
     */
    stop(): void;
    #private;
}
export default WebSocketBridge;
import { WebSocketServer } from 'ws';
