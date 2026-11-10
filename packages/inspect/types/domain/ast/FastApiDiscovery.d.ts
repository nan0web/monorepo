/**
 * @typedef {Object} MemberInfo
 * @property {string} name
 * @property {string} [type]
 * @property {string} [returnType]
 * @property {string[]} [parameters]
 * @property {boolean} [isAsync]
 * @property {boolean} [isStatic]
 * @property {string} [description]
 * @property {Record<string, any>} [schema]
 */
/**
 * @typedef {Object} ClassContract
 * @property {string} name
 * @property {string} [description]
 * @property {MemberInfo[]} [fields]
 * @property {MemberInfo[]} [methods]
 */
/**
 * FastApiDiscovery — High-speed AST extraction of class declarations, fields, and method contracts.
 */
export class FastApiDiscovery extends Model {
    /**
     * @param {Object} [data]
     * @param {Object} [options]
     */
    constructor(data?: any, options?: any);
    /** @type {import('@nan0web/db').DB} Injected DB */
    $db: import("@nan0web/db").DB;
    /**
     * Extracts API contract from TypeScript/JavaScript source string.
     * @param {string} source
     * @param {Object} [options]
     * @param {string} [options.fileName]
     * @param {string} [options.level] 'classes' | 'methods' | 'fields' | 'all'
     * @param {string} [options.only] 'static' | 'async' | 'methods' | 'fields'
     * @param {boolean} [options.includeDeps]
     * @returns {{ exports: Record<string, ClassContract>, deps?: string[] }}
     */
    extractFromSource(source: string, options?: {
        fileName?: string;
        level?: string;
        only?: string;
        includeDeps?: boolean;
    }): {
        exports: Record<string, ClassContract>;
        deps?: string[];
    };
    /**
     * Reads file via injected DB and extracts API contract.
     * @param {string} filePath
     * @param {Object} [options]
     * @returns {Promise<{ exports: Record<string, ClassContract>, deps?: string[] }>}
     */
    extractFromFile(filePath: string, options?: any): Promise<{
        exports: Record<string, ClassContract>;
        deps?: string[];
    }>;
    /**
     * Formats extracted contract into structured dictionary for NaN0 serialization.
     * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
     * @param {Object} [options]
     * @param {'short' | 'full'} [options.style]
     * @returns {Record<string, any>}
     */
    toContractObject(extracted: {
        exports: Record<string, ClassContract>;
        deps?: string[];
    }, options?: {
        style?: "short" | "full";
    }): Record<string, any>;
    /**
     * Formats extracted contract into concise Nano string via NaN0.stringify.
     * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
     * @param {Object} [options]
     * @param {'short' | 'full'} [options.style]
     * @returns {string}
     */
    stringify(extracted: {
        exports: Record<string, ClassContract>;
        deps?: string[];
    }, options?: {
        style?: "short" | "full";
    }): string;
    /**
     * Backward compatibility helper for toNanoYaml.
     * @param {{ exports: Record<string, ClassContract>, deps?: string[] }} extracted
     * @param {Object} [options]
     * @returns {string}
     */
    toNanoYaml(extracted: {
        exports: Record<string, ClassContract>;
        deps?: string[];
    }, options?: any): string;
}
export type MemberInfo = {
    name: string;
    type?: string;
    returnType?: string;
    parameters?: string[];
    isAsync?: boolean;
    isStatic?: boolean;
    description?: string;
    schema?: Record<string, any>;
};
export type ClassContract = {
    name: string;
    description?: string;
    fields?: MemberInfo[];
    methods?: MemberInfo[];
};
import { Model } from '@nan0web/types';
