/**
 * Good
 *
 * Ontology of value proposal (product, service, tariff, program).
 * Represents anything that can be offered, contracted, or subscribed to.
 *
 * @class Good
 * @extends Interaction
 */
export default class Good extends Interaction {
    static type: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Type must be product, service, tariff, or program";
    };
    static excerpt: {
        type: string;
        help: string;
        default: string;
    };
    static body: {
        type: string;
        help: string;
        default: string;
    };
    static currency: {
        type: string;
        help: string;
        default: string;
    };
    static price: {
        type: string;
        help: string;
        default: {};
    };
    static features: {
        type: string;
        help: string;
        default: never[];
    };
    static documents: {
        type: string;
        help: string;
        default: never[];
    };
    /** @type {string} */
    excerpt: string;
    /** @type {string} */
    currency: string;
    /** @type {number | Record<string, any>} */
    price: number | Record<string, any>;
    /** @type {string[]} */
    features: string[];
    /** @type {string[]} */
    documents: string[];
    /**
     * @type {number}
     */
    get amount(): number;
}
import Interaction from './Interaction.js';
