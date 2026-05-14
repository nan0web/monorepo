/**
 * SandboxModel — OLMUI Model-as-Schema
 * Environment for testing and previewing UI components with dynamic property editing.
 */
export class SandboxModel extends Model {
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
    /** @type {string[]} List of registered UI components available for inspection */ components: string[];
    /** @type {string} The component currently being inspected in the sandbox */ selectedComponent: string;
    /** @type {'yaml'|'css'|'json'} The file format chosen to export the custom theme configuration */ themeFormat: "yaml" | "css" | "json";
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
import { Model } from '@nan0web/types';
