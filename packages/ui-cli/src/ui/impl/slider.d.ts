/**
 * Slider module – numeric range selection with a visual bar and Shift-jumps.
 * @module ui/slider
 */
import NumberPrompt from 'prompts/lib/elements/number.js';
/**
 * Custom SliderPrompt that adds visual bar and Shift+Up/Down jumps.
 */
export declare class SliderPrompt extends NumberPrompt {
    #private;
    jump: any;
    /** @type {boolean} */
    shift: boolean;
    value: number;
    /** @param {any} opts */
    constructor(opts: any);
    up(): void;
    down(): void;
    left(): void;
    right(): void;
    /**
     * @param {string} key
     * @param {any} keypress
     */
    _(key: string, keypress: any): void;
    render(): void;
}
/**
 * @param {Object} config
 * @param {string} config.message
 * @param {number} [config.initial]
 * @param {number} [config.min=0]
 * @param {number} [config.max=100]
 * @param {number} [config.step=1]
 * @param {number} [config.jump]
 * @param {Function} [config.t] - Optional translation function.
 * @returns {Promise<{value:number, cancelled:boolean}>}
 */
export declare function slider(config: {
    message: string;
    initial?: number;
    min?: number;
    max?: number;
    step?: number;
    jump?: number;
    t?: Function;
}): Promise<{
    value: number;
    cancelled: boolean;
}>;
