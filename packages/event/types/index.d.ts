/**
 * Main event factory function - always returns memory adapter
 * @returns {import("./types/index.js").EventBus}
 */
export default function event(): import("./types/index.js").EventBus;
export { EventContext };
import EventContext from './types/EventContext.js';
