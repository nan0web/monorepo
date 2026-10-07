/**
 * Service
 *
 * An interaction that represents an offer or request.
 *
 * @class Service
 * @extends Interaction
 */
export default class Service extends Interaction {
    static type: {
        type: string;
        validate: (val: any) => true | "Must be offer or request";
    };
    static currency: {
        type: string;
        default: string;
    };
    /** @type {string} */
    type: string;
    /** @type {string} */
    currency: string;
}
import Interaction from './Interaction.js';
