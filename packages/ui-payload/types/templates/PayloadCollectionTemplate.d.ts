/** @typedef {Object} Field */
/**
 * PayloadCollectionTemplate - Model to generate Payload CMS CollectionConfig using CodeTemplate.
 */
export class PayloadCollectionTemplate extends Model {
    static alias: string;
    static collectionSlug: {
        help: string;
        default: string;
    };
    static useAsTitle: {
        help: string;
        default: string;
    };
    static labels: {
        help: string;
        default: {
            singular: string;
            plural: string;
        };
    };
    static group: {
        help: string;
        type: string;
        default: string;
    };
    static fields: {
        help: string;
        default: never[];
    };
    static template: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<PayloadCollectionTemplate>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<PayloadCollectionTemplate>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Collection slug */ collectionSlug: string;
    /** @type {string} Label/title field name */ useAsTitle: string;
    /** @type {Object} Labels object */ labels: any;
    /** @type {Object|string} Group object or string */ group: any | string;
    /** @type {Array<Field>} Collection fields */ fields: Array<Field>;
    /** @type {Object} Custom replace snippets */ snippets: any;
    /**
     * Compiles the CollectionConfig template using native CodeTemplate replace blocks.
     * @returns {Promise<string>} Generated TS code for the collection
     */
    compile(): Promise<string>;
    /**
     * Synchronously compiles the CollectionConfig template.
     * @returns {string} Generated TS code for the collection
     */
    compileSync(): string;
}
export type Field = any;
import { Model } from '@nan0web/types';
