/**
 * Model-as-Schema for the entire UI Sandbox Showcase.
 * Represents a complete User Journey demonstrating all components.
 */
export class ShowcaseAppModel extends Model {
    static $id: string;
    static UI: {
        appName: string;
        startBtn: string;
        generateConfirm: string;
        aborted: string;
        success: string;
        cancelled: string;
        tableProperty: string;
        tableValue: string;
        tableStatus: string;
        tableStatusActive: string;
    };
    static appTitle: {
        alias: string;
        help: string;
        default: string;
        type: string;
    };
    /**
     * @param {Partial<ShowcaseAppModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<ShowcaseAppModel> | Record<string, any>, options?: object);
    /** @type {string} App name help */ appTitle: string;
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
