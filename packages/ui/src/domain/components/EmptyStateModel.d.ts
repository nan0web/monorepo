import { Model } from '@nan0web/types';
import Navigation from '../Navigation.js';
/**
 * EmptyStateModel — OLMUI Model-as-Schema
 * Onboarding placeholder for empty tables, lists, or dashboards.
 */
export declare class EmptyStateModel extends Model {
    static $id: string;
    static icon: {
        help: string;
        placeholder: string;
        default: string;
    };
    static title: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static description: {
        help: string;
        placeholder: string;
        default: string;
    };
    static action: {
        help: string;
        type: string;
        hint: typeof Navigation;
        default: null;
    };
    /**
     * @param {Partial<EmptyStateModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<EmptyStateModel> | Record<string, any>, options?: object);
}
