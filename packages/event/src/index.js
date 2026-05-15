import { createMemoryAdapter } from './adapters/memory.js'
import EventContext from './types/EventContext.js'

export { EventContext }

/**
 * Main event factory function - always returns memory adapter
 * @returns {import("./types/index.js").EventBus}
 */
export default function event() {
	return createMemoryAdapter()
}

/** @typedef {import("./types/index.js").EventBus} EventBus */
/** @typedef {import("./types/index.js").EventListener} EventListener */
