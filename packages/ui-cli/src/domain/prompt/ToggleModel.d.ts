import { Model } from '@nan0web/types';
/**
 * Model describing the Toggle (Yes/No Switch) component.
 */
export declare class ToggleModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
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
     * @param {Partial<ToggleModel> | Record<string, any> | boolean} [data] Input model data or initial state.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<ToggleModel> | Record<string, any> | boolean, options?: object);
    /**
     * Map a predefined answer to a toggle result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: boolean, cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: boolean;
        cancelled: boolean;
    };
}
