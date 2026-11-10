/**
 * Event
 *
 * Space-time ontology model (location, branch, event, milestone, hearing).
 *
 * @class Event
 * @extends Interaction
 */
export default class Event extends Interaction {
    static type: {
        type: string;
        help: string;
        default: string;
        validate: (val: any) => true | "Type must be location, branch, event, milestone, or hearing";
    };
    static location: {
        type: string;
        help: string;
        default: string;
    };
    static coordinates: {
        type: string;
        help: string;
        default: {};
    };
    static starts_at: {
        type: string;
        help: string;
    };
    static ends_at: {
        type: string;
        help: string;
    };
    static contacts: {
        type: string;
        help: string;
        default: never[];
    };
    /** @type {string} */
    location: string;
    /** @type {{ lat?: number, lng?: number }} */
    coordinates: {
        lat?: number;
        lng?: number;
    };
    /** @type {Date|null} */
    starts_at: Date | null;
    /** @type {Date|null} */
    ends_at: Date | null;
    /** @type {Contact[]} */
    contacts: Contact[];
}
import Interaction from './Interaction.js';
import Contact from './Contact.js';
