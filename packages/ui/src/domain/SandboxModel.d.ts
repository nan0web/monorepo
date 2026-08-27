import { Model } from '@nan0web/types';
/**
 * SandboxModel — OLMUI Model-as-Schema
 * Environment for testing and previewing UI components with dynamic property editing.
 * @extends {Model}
 */
export declare class SandboxModel extends Model {
    selectedComponent: any;
    themeFormat: any;
    static $id: string;
    static UI: {
        breadcrumb: string;
        componentsHelp: string;
        selectedComponentHelp: string;
        selectedComponentPlaceholder: string;
        themeFormatHelp: string;
        selectComponentHelp: string;
        configurePropertiesHelp: string;
        exportFormatHelp: string;
    };
    static components: {
        help: string;
        type: string;
        default: never[];
    };
    static selectedComponent: {
        help: string;
        placeholder: string;
        default: string;
    };
    static themeFormat: {
        help: string;
        options: string[];
        default: string;
    };
    /**
     * @param {Partial<SandboxModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<SandboxModel> | Record<string, any>, options?: object);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
