export default EventContext;
/**
 * Event context class with preventDefault support
 * @template T = any
 */
declare class EventContext<T> {
    /**
     * Creates EventContext from input
     * @param {*} input
     * @returns {EventContext}
     */
    static from(input: any): EventContext<any>;
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
        type?: string | undefined;
        name?: string | undefined;
        data?: T | undefined;
        meta?: object;
        error?: Error | null | undefined;
        defaultPrevented?: boolean | undefined;
    });
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
     * Prevents further event propagation
     */
    preventDefault(): void;
    /**
     * Clone context
     * @returns {EventContext}
     */
    clone(): EventContext<any>;
}
