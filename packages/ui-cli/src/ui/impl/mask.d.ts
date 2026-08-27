/**
 * Mask module – provides interactive formatted input handling.
 *
 * @module ui/mask
 */
/**
 * Interactive formatted mask input.
 *
 * NOTE: Predefined/test answers are handled upstream by InputAdapter.requestMask
 * via answerQueue. This function only runs in interactive TTY mode.
 *
 * @param {Object} config
 * @param {string} config.message - Prompt question
 * @param {string} config.mask - Mask pattern (e.g., '+38 (099) 999 9999')
 * @param {string} [config.placeholder] - Character or string placeholder
 * @param {string} [config.formatMsg] - Format error message
 * @param {Function} [config.t] - Translation function
 * @returns {Promise<{value: string, cancelled: boolean}>}
 */
export declare function mask(config: {
    message: string;
    mask: string;
    placeholder?: string;
    formatMsg?: string;
    t?: Function;
}): Promise<{
    value: string;
    cancelled: boolean;
}>;
