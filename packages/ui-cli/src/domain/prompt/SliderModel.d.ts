import { Model } from '@nan0web/types';
/**
 * Model describing the Slider (Number range) component.
 */
export declare class SliderModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static min: {
        default: number;
    };
    static max: {
        default: number;
    };
    static step: {
        default: number;
    };
    static initial: {
        default: number;
    };
    /**
     * @param {Partial<SliderModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SliderModel> | Record<string, any>, options?: object);
    /**
     * Map a predefined answer to a numeric result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: number, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: number;
        cancelled: boolean;
    };
}
