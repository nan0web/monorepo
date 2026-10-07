/**
 * Connection
 *
 * Defines the relationship (role/context) between an Identity and a Context.
 * Extends standard Model.
 *
 * @class Connection
 * @extends Model
 */
export default class Connection extends Model {
    static target_did: {
        type: string;
        help: string;
    };
    static context: {
        type: string;
        help: string;
    };
    static role: {
        type: string;
        help: string;
    };
    static attributes: {
        type: string;
        default: {};
        help: string;
    };
    /** @type {string} */
    target_did: string;
    /** @type {string} */
    context: string;
    /** @type {string} */
    role: string;
    /** @type {object} */
    attributes: object;
}
import { Model } from '@nan0web/types';
