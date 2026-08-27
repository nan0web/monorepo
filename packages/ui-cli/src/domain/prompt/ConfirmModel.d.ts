import { Model } from '@nan0web/types';
/**
 * Model describing the Confirm component (Yes/No prompt).
 */
export declare class ConfirmModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: {
        default: string;
    };
    static UI_YES: {
        alias: string;
        default: string;
    };
    static UI_NO: {
        alias: string;
        default: string;
    };
    static initial: {
        default: boolean;
    };
    /**
     * @param {Partial<ConfirmModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ConfirmModel> | Record<string, any>, options?: object);
    /**
     * Map a predefined answer to a confirmation result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: boolean, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: boolean;
        cancelled: boolean;
    };
}
