import { Model } from '@nan0web/types';
/**
 * Model describing the Sortable component parameters.
 */
export declare class SortableModel extends Model {
    static UI: {
        alias: string[];
        default: string;
    };
    static help: string;
    static UI_HINT: {
        alias: string;
        default: string;
    };
    static UI_NAV: {
        default: string;
    };
    static UI_GRAB: {
        default: string;
    };
    static UI_CONFIRM: {
        default: string;
    };
    static items: {
        default: never[];
    };
    /**
     * @param {Partial<SortableModel> | Record<string, any>} [data] Input model data.
     * @param {object} [options] Options.
     */
    constructor(data?: Partial<SortableModel> | Record<string, any>, options?: object);
    /**
     * Map a predefined comma-separated answer to a sortable result.
     *
     * @param {string} predefined - Injected answer.
     * @returns {{value: any[], cancelled: boolean}}
     */
    automatedInput(predefined: string): {
        value: any[];
        cancelled: boolean;
    };
}
