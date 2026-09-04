/**
 * Access control layer for the database.
 * Handles connection state, authorization checks, and driver access.
 * Extends DBBase to add authentication and connectivity guarantees.
 *
 * @class
 * @extends {DBBase}
 */
export default class DBAccess extends DBBase {
    /**
     * Ensures access to document with context.
     * Delegates to driver for authorization checks.
     * @param {string} uri - Document URI
     * @param {'r'|'w'|'d'} [level="r"] - Access level
     * @param {AuthContext | object} [context=this.context] - Auth context: { username, role, roles, user }
     * @returns {Promise<void>}
     * @throws {Error} - Access denied
     */
    ensureAccess(uri: string, level?: "r" | "w" | "d", context?: AuthContext | object): Promise<void>;
    /**
     * Connects to the database. This method should be overridden by subclasses.
     * Initializes in-memory data from predefined and builds directory metadata.
     * @abstract
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnects from the database.
     * Clears in-memory data and metadata caches.
     * @abstract
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
import DBBase from './DBBase.js';
import AuthContext from '../AuthContext.js';
