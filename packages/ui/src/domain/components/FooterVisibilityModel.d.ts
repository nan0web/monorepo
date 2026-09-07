/**
 * FooterVisibilityModel — OLMUI Model-as-Schema
 * Boolean flags controlling which footer elements are visible.
 */
export class FooterVisibilityModel extends Model {
    static $id: string;
    static copyright: {
        help: string;
        default: boolean;
        type: string;
    };
    static version: {
        help: string;
        default: boolean;
        type: string;
    };
    static license: {
        help: string;
        default: boolean;
        type: string;
    };
    static nav: {
        help: string;
        default: boolean;
        type: string;
    };
    static clock: {
        help: string;
        default: boolean;
        type: string;
    };
    /**
     * @param {Partial<FooterVisibilityModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<FooterVisibilityModel> | Record<string, any>, options?: object);
    /** @type {boolean} Show copyright text */ copyright: boolean;
    /** @type {boolean} Show version string */ version: boolean;
    /** @type {boolean} Show license info */ license: boolean;
    /** @type {boolean} Show footer navigation */ nav: boolean;
    /** @type {boolean} Show clock widget */ clock: boolean;
}
import { Model } from '@nan0web/types';
