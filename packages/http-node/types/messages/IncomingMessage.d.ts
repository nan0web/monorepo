import { IncomingMessage as HttpIncomingMessage } from 'node:http';
/**
 * Extended HTTP Incoming Message class for Node.js environment
 * @extends {HttpIncomingMessage}
 */
declare class IncomingMessage extends HttpIncomingMessage {
    params: {};
    method: any;
    url: any;
    _query: {} | undefined;
    /**
     * Creates a new IncomingMessage instance
     * @param {import('node:net').Socket} socket - The socket
     * @param {Object} [options={}] - Options
     */
    constructor(socket: import('node:net').Socket, options?: any);
    /**
     * Lazy-parsed query parameters from the URL
     * @type {Record<string, string>}
     */
    get query(): Record<string, string>;
    /**
     * Implements Readable stream _read method
     */
    _read(): void;
}
export default IncomingMessage;
