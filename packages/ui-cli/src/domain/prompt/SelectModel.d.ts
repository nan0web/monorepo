import { Model } from '@nan0web/types';
/**
 * Model describing the Select component (Radio-button list).
 */
export declare class SelectModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: {
        default: string;
    };
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static UI_MORE: {
        default: string;
    };
    static UI_RESULT: {
        default: string;
    };
    static UI_PROMPT: {
        default: string;
    };
    static initial: {
        default: number;
    };
    static options: {
        default: never[];
    };
    /**
     * @param {Partial<SelectModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SelectModel> | Record<string, any>, options?: object);
    /**
     * Map a predefined string answer to a selection result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: any, index: number, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: any;
        index: number;
        cancelled: boolean;
    };
}
