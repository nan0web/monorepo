/**
 * Connection
 *
 * Defines the relationship (role/context/navigation/taxonomy) between entities.
 * Extends standard Model.
 *
 * @class Connection
 * @extends Model
 */
export default class Connection extends Model {
    static id: {
        type: string;
        help: string;
    };
    static title: {
        type: string;
        help: string;
        default: string;
    };
    static context: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Context must be navigation, category, or relation";
    };
    static role: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true;
    };
    static target_did: {
        type: string;
        help: string;
        default: string;
    };
    static items: {
        type: string;
        help: string;
        default: never[];
    };
    static attributes: {
        type: string;
        default: {};
        help: string;
    };
    /**
     * @param {Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Unique identifier */ id: string;
    /** @type {string} Connection title */ title: string;
    /** @type {'navigation' | 'category' | 'relation'} Context type */ context: "navigation" | "category" | "relation";
    /** @type {'header' | 'footer' | 'topic' | 'partner' | string} Role */ role: "header" | "footer" | "topic" | "partner" | string;
    /** @type {string} Target DID or ID */ target_did: string;
    /** @type {Array<Record<string, any>>} Hierarchical navigation items */ items: Array<Record<string, any>>;
    /** @type {Record<string, any>} Context-specific attributes */ attributes: Record<string, any>;
}
import { Model } from '@nan0web/types';
