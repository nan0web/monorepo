/**
 * Creates a DOM-based event adapter
 * @param {EventTarget} [target] - DOM target (e.g. window, document)
 * @returns {import("../types/index.js").EventBus}
 */
export function createDomAdapter(
	target?: EventTarget | undefined,
): import('../types/index.js').EventBus
