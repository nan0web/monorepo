/**
 * Event
 *
 * An interaction that is bound to a specific location and start time.
 *
 * @class Event
 * @extends Interaction
 */
export default class Event extends Interaction {
    static starts_at: {
        type: string;
    };
    static location: {
        type: string;
    };
    /** @type {string} */
    starts_at: string;
    /** @type {string} */
    location: string;
}
import Interaction from './Interaction.js';
