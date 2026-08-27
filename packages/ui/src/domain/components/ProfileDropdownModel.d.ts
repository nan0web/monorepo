import { Model } from '@nan0web/types';
import Navigation from '../Navigation.js';
/**
 * ProfileDropdownModel — OLMUI Model-as-Schema
 * Account/profile dropdown in the header (user menu).
 */
export declare class ProfileDropdownModel extends Model {
    static $id: string;
    static profileName: {
        alias: string;
        help: string;
        placeholder: string;
        default: string;
    };
    static email: {
        help: string;
        placeholder: string;
        default: string;
    };
    static avatar: {
        help: string;
        placeholder: string;
        default: string;
    };
    static actions: {
        help: string;
        type: string;
        hint: typeof Navigation;
        default: never[];
    };
    /**
     * @param {Partial<ProfileDropdownModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ProfileDropdownModel> | Record<string, any>, options?: object);
}
