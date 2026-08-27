import Router from './Router.js';
import Server from './Server.js';
/**
 * Create new server
 * @param {import("./Server.js").ServerOptions} options
 * @returns {Server}
 */
declare function createServer(options: import("./Server.js").ServerOptions): Server;
export { Server, Router, createServer };
export default createServer;
