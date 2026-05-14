/**
 * HeaderVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which header elements are visible.
 */
export class HeaderVisibilityModel extends Model {
    static $id: string;
    static logo: {
        help: string;
        default: boolean;
        type: string;
    };
    static theme: {
        help: string;
        default: boolean;
        type: string;
    };
    static search: {
        help: string;
        default: boolean;
        type: string;
    };
    static share: {
        help: string;
        default: boolean;
        type: string;
    };
    static nav: {
        help: string;
        default: boolean;
        type: string;
    };
    static langs: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<HeaderVisibilityModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<HeaderVisibilityModel> | Record<string, any>, options?: object);
    /** @type {boolean} Show logo */ logo: boolean;
    /** @type {boolean} Show theme toggle (dark/light) */ theme: boolean;
    /** @type {boolean} Show search input */ search: boolean;
    /** @type {boolean} Show share button */ share: boolean;
    /** @type {boolean} Show navigation links */ nav: boolean;
    /** @type {boolean} Show language switcher */ langs: boolean;
}
import { Model } from '@nan0web/types';
