/**
 * Identity
 *
 * Decentralized Identity manifest (who am I: person, org, or site).
 * Extends standard Model.
 *
 * @class Identity
 * @extends Model
 */
export default class Identity extends Model {
    static id: {
        type: string;
        help: string;
    };
    static did: {
        type: string;
        help: string;
    };
    static type: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Type must be person, org, or site";
    };
    static title: {
        type: string;
        help: string;
        default: string;
        validate: (v: any) => true | "Title must be a string";
    };
    static name: {
        type: string;
        help: string;
        default: string;
    };
    static role: {
        type: string;
        help: string;
        default: string;
    };
    static declaration: {
        type: string;
        help: string;
        default: string;
    };
    static avatar: {
        type: string;
        help: string;
        default: string;
    };
    static public_keys: {
        type: string;
        help: string;
        default: never[];
    };
    static wallets: {
        type: string;
        help: string;
        default: never[];
    };
    static endpoints: {
        type: string;
        help: string;
        default: never[];
    };
    static credentials: {
        type: string;
        help: string;
        default: {};
    };
    /**
     * @param {Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Unique subject identifier (DID or slug) */ id: string;
    /** @type {string} Alias to id (Decentralized Identifier) */ did: string;
    /** @type {'person' | 'org' | 'site'} Subject type */ type: "person" | "org" | "site";
    /** @type {string} Subject title / name */ title: string;
    /** @type {string} Alias to title */ name: string;
    /** @type {string} Position / slogan / occupation */ role: string;
    /** @type {string} Manifesto, bio, or mission (Markdown) */ declaration: string;
    /** @type {string} Media ID reference to avatar */ avatar: string;
    /** @type {string[]} Public keys */ public_keys: string[];
    /** @type {string[]} Crypto/Fiat wallets */ wallets: string[];
    /** @type {Record<string, any>} Additional credentials/licenses */ credentials: Record<string, any>;
    /** @type {Contact[]} Contact endpoints (parsed to Contact[]) */ endpoints: Contact[];
    /**
     * @type {Contact[]}
     */
    get contacts(): Contact[];
}
import { Model } from '@nan0web/types';
import Contact from './Contact.js';
