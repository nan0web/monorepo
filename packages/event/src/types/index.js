/**
 * @template [T=any]
 * @callback EventListener
 * @param {EventContext<T>} ctx
 * @returns {void | Promise<void>}
 * @exports EventListener
 */

/**
 * @typedef {Object} EventBus
 * @property {(event: string, fn: EventListener) => void} on - Subscribe to an event. Adds a listener function to the specified event type. The listener will be invoked every time the event is emitted unless removed.
 * @property {(event: string, fn: EventListener) => void} off - Unsubscribe from an event. Removes a previously added listener function from the specified event type.
 * @property {(event: string, data?: any) => Promise<EventContext>} emit - Emit an event. Dispatches the specified event with optional data to all registered listeners. Returns a promise resolving to the final event context after all listeners have processed it.
 * @exports EventBus
 */

import EventContext from './EventContext.js'

export { EventContext }

export {}
