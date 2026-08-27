/**
 * @typedef {'fs'|'redis'|'http'|'memory'} DBProtocolName
 */
/**
 * @typedef {Object} DBConfigType
 * @property {string} url Connection URL or directory path
 * @property {DBProtocolName} protocol Database adapter type
 * @property {string} username Authentication username
 * @property {string} password Authentication password (sensitive)
 * @property {string} database Logical database name or namespace
 * @property {number} maxRetries Maximum reconnection attempts
 * @property {number} timeoutMs Connection timeout in milliseconds
 */
/**
 * DBConfig — Model-as-Schema for database connection configuration.
 *
 * Describes the connection parameters for a database adapter.
 * Embedded within NaN0WebConfig as nested model.
 *
 * Supported protocols (via DBConfig.protocol):
 *   - 'fs'    → @nan0web/db-fs (default, file system)
 *   - 'redis' → @nan0web/db-redis
 *   - 'http'  → @nan0web/db-browser (remote REST)
 *
 * See user-stories.md (lines 18-20)
 *
 * @property {string} url Connection URL or directory path
 * @property {DBProtocolName} protocol Database adapter type
 * @property {string} username Authentication username
 * @property {string} password Authentication password (sensitive)
 * @property {string} database Logical database name or namespace
 * @property {number} maxRetries Maximum reconnection attempts
 * @property {number} timeoutMs Connection timeout in milliseconds
 */
export default class DBConfig extends Model {
    static UI: {
        title: string;
        description: string;
        icon: string;
    };
    static url: {
        alias: string;
        help: string;
        placeholder: string;
        type: string;
        default: string;
        required: boolean;
        validate: (v: any) => true | "error_db_url_required";
    };
    static protocol: {
        help: string;
        type: string;
        options: string[];
        default: string;
    };
    static username: {
        help: string;
        type: string;
        default: string;
        hidden: boolean;
    };
    static password: {
        help: string;
        type: string;
        default: string;
        hidden: boolean;
    };
    static database: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static maxRetries: {
        help: string;
        type: string;
        default: number;
    };
    static timeoutMs: {
        help: string;
        type: string;
        default: number;
    };
    /**
     * Detect protocol from URL string.
     * @param {string} url
     * @returns {'fs'|'redis'|'http'|'memory'}
     */
    static detectProtocol(url: string): "fs" | "redis" | "http" | "memory";
    /**
     * Parses DSN string into its components.
     * @param {string} dsn
     * @returns {Partial<DBConfigType>}
     */
    static parseDsn(dsn: string): Partial<DBConfigType>;
    /**
     * @param {Partial<DBConfigType> | string | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<DBConfigType> | string | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /**
     * Build a sanitized DSN string (without credentials).
     * Safe for logging and diagnostics.
     * @returns {string}
     */
    get safeDsn(): string;
}
export type DBProtocolName = "fs" | "redis" | "http" | "memory";
export type DBConfigType = {
    /**
     * Connection URL or directory path
     */
    url: string;
    /**
     * Database adapter type
     */
    protocol: DBProtocolName;
    /**
     * Authentication username
     */
    username: string;
    /**
     * Authentication password (sensitive)
     */
    password: string;
    /**
     * Logical database name or namespace
     */
    database: string;
    /**
     * Maximum reconnection attempts
     */
    maxRetries: number;
    /**
     * Connection timeout in milliseconds
     */
    timeoutMs: number;
};
import { Model } from '@nan0web/types';
