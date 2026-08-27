/**
 * @file Main export for @nan0web/db-server.
 *
 * Usage:
 * ```js
 * import DBServer from '@nan0web/db-server'
 * const server = await DBServer.create({ db, port: 3456 })
 * ```
 */
import DBServer from './DBServer.js';
import { DBServerApp } from './DBServerApp.js';
export { DBServer, DBServerApp };
export default DBServer;
