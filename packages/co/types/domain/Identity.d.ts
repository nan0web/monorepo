/**
 * Identity
 *
 * Decentralized Identity manifest (who am I).
 * Extends standard Model.
 *
 * @class Identity
 * @extends Model
 */
export default class Identity extends Model {
    static did: {
        type: string;
        help: string;
    };
    static public_keys: {
        type: string;
        default: never[];
    };
    static name: {
        type: string;
        validate: (v: any) => true | "Name is required";
    };
    static declaration: {
        type: string;
        help: string;
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
    constructor(data?: {}, options?: {});
    /** @type {string} */
    did: string;
    /** @type {string[]} */
    public_keys: string[];
    /** @type {string} */
    name: string;
    /** @type {string} */
    declaration: string;
    /** @type {string[]} */
    wallets: string[];
    /** @type {Contact[]} */
    endpoints: Contact[];
}
import { Model } from '@nan0web/types';
import Contact from './Contact.js';
