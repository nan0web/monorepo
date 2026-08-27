import { EventContext } from './index.js';
/**
 * Base Event class for extension
 */
export default class Event {
    emitter: import("./types/index.js").EventBus;
    /**
     * @param {object} input
     * @param {import("./types/index.js").EventBus} [input.emitter]
     */
    constructor(input?: {
        emitter?: import("./types/index.js").EventBus;
    });
    /**
     * Listen to an event
     * @param {string} event
     * @param {import("./types/index.js").EventListener} fn
     */
    on(event: string, fn: import("./types/index.js").EventListener): void;
    /**
     * Unlisten to an event
     * @param {string} event
     * @param {import("./types/index.js").EventListener} fn
     */
    off(event: string, fn: import("./types/index.js").EventListener): void;
    /**
     * Emit an event
     * @param {string} event
     * @param {any} data
     * @returns {Promise<EventContext>}
     */
    emit(event: string, data: any): Promise<EventContext<any>>;
}
