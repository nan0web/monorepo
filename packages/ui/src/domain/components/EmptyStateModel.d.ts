/**
 * EmptyStateModel — OLMUI Model-as-Schema
 * Onboarding placeholder for empty tables, lists, or dashboards.
 */
export class EmptyStateModel extends Model {
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
    /** @type {string} Illustration or icon name for the empty state */ icon: string;
    /** @type {string} Empty state headline */ title: string;
    /** @type {string} Helpful description guiding the user */ description: string;
    /** @type {Navigation|null} Primary CTA action (Navigation link or button) */ action: Navigation | null;
}
import { Model } from '@nan0web/types';
import Navigation from '../Navigation.js';
