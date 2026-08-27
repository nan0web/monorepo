/**
 * Main event factory function - always returns memory adapter
 * @returns {import("./types/index.js").EventBus}
 */
export default function event(): import("./types/index.js").EventBus;
export { EventContext };
export type EventBus = import("./types/index.js").EventBus;
export type EventListener = import("./types/index.js").EventListener;
import EventContext from './types/EventContext.js';
