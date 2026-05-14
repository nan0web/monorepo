/**
 * Base Event class for extension
 */
export default class Event {
    /**
     * @param {object} input
     * @param {import("./types/index.js").EventBus} [input.emitter]
     */
    constructor(input?: {
        emitter?: import("./types/index.js").EventBus | undefined;
    });
    emitter: import("./types/index.js").EventBus;
    on(event: any, fn: any): void;
    off(event: any, fn: any): void;
    emit(event: any, data: any): Promise<import("./types/EventContext.js").default<any>>;
}
