import EventContext from './types/EventContext.js';
export { EventContext };
/**
 * Main event factory function - always returns memory adapter
 * @returns {import("./types/index.js").EventBus}
 */
export default function event(): import("./types/index.js").EventBus;
export type EventBus = import("./types/index.js").EventBus;
export type EventListener = import("./types/index.js").EventListener;
/** @typedef {import("./types/index.js").EventBus} EventBus */
/** @typedef {import("./types/index.js").EventListener} EventListener */
