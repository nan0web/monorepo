/**
 * Event context class with preventDefault support
 * @template T = any
 */
declare class EventContext<T> {
    /** @type {string} */
    type: string;
    /** @type {string} */
    name: string;
    /** @type {Error | null} */
    error: Error | null;
    /** @type {T | undefined} */
    data: T | undefined;
    /** @type {object} */
    meta: object;
    /** @type {boolean} */
    defaultPrevented: boolean;
    /**
     * @param {object} input
     * @param {string} [input.type]
     * @param {string} [input.name]
     * @param {T} [input.data]
     * @param {object} [input.meta]
     * @param {Error | null} [input.error]
     * @param {boolean} [input.defaultPrevented]
     */
    constructor(input?: {
        type?: string;
        name?: string;
        data?: T;
        meta?: object;
        error?: Error | null;
        defaultPrevented?: boolean;
    });
    /**
     * Clone context
     * @returns {EventContext}
     */
    clone(): EventContext<any>;
    /**
     * Prevents further event propagation
     */
    preventDefault(): void;
    /**
     * Creates EventContext from input
     * @param {*} input
     * @returns {EventContext}
     */
    static from(input: any): EventContext<any>;
}
export default EventContext;
