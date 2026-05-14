export { EventContext };
export type EventListener<T = any> = (ctx: EventContext<T>) => void | Promise<void>;
export type EventBus = {
    /**
     * - Subscribe to an event. Adds a listener function to the specified event type. The listener will be invoked every time the event is emitted unless removed.
     */
    on: (event: string, fn: EventListener) => void;
    /**
     * - Unsubscribe from an event. Removes a previously added listener function from the specified event type.
     */
    off: (event: string, fn: EventListener) => void;
    /**
     * - Emit an event. Dispatches the specified event with optional data to all registered listeners. Returns a promise resolving to the final event context after all listeners have processed it.
     */
    emit: (event: string, data?: any) => Promise<EventContext<any>>;
};
import EventContext from './EventContext.js';
