/**
 * @typedef {Object} AppConfig
 * @property {DB} db - Database instance.
 * @property {Logger|NoLogger} logger - Logging instance.
 */
/**
 * Core application class.
 *
 * Provides event handling (via {@link event}), a simple in‑memory DB,
 * and a message‑centric `run` method that yields {@link OutputMessage}s.
 *
 * @class App
 */
export default class App {
    static InputMessage: typeof InputMessage;
    static OutputMessage: typeof OutputMessage;
    /**
     * Create a new App instance.
     *
     * @param {Partial<AppConfig>} [config={}]
     */
    constructor(config?: Partial<AppConfig>);
    /** @returns {typeof App.InputMessage} */
    get InputMessage(): typeof App.InputMessage;
    /** @returns {typeof App.OutputMessage} */
    get OutputMessage(): typeof App.OutputMessage;
    /** @returns {DB} */
    get db(): DB;
    /** @returns {Logger|NoLogger} */
    get logger(): Logger | NoLogger;
    /**
     * Main handler – receives an {@link InputMessage} and yields one or more {@link OutputMessage}s.
     *
     * @param {InputMessage} msg
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg: InputMessage): AsyncGenerator<OutputMessage>;
    /**
     * Emit an event on the internal bus.
     *
     * @param {string} event
     * @param {any} data
     * @returns {Promise<EventContext>}
     */
    emit(event: string, data: any): Promise<EventContext<any>>;
    /**
     * Subscribe to an event.
     *
     * @param {string} event
     * @param {import("@nan0web/event").EventListener} fn
     */
    on(event: string, fn: import("@nan0web/event").EventListener): void;
    /**
     * Unsubscribe from an event.
     *
     * @param {string} event
     * @param {import("@nan0web/event").EventListener} fn
     */
    off(event: string, fn: import("@nan0web/event").EventListener): void;
    #private;
}
export type AppConfig = {
    /**
     * - Database instance.
     */
    db: DB;
    /**
     * - Logging instance.
     */
    logger: Logger | NoLogger;
};
import DB from '@nan0web/db';
import Logger from '@nan0web/log';
import { NoLogger } from '@nan0web/log';
import InputMessage from './InputMessage.js';
import OutputMessage from './OutputMessage.js';
import { EventContext } from '@nan0web/event';
