/**
 * @typedef {Object} AppOptions
 * @property {InputAdapter} adapter
 * @property {string} parentPath
 * @property {boolean} _isExplicit
 */
/** @typedef {import('@nan0web/types').ModelOptions & AppOptions} ModelAsAppOptions */
/**
 * The model with a run generator.
 * @property {boolean} help Show help
 */
export class ModelAsApp extends Model {
    static help: {
        help: string;
        default: boolean;
    };
    /**
     * Execute the model programmatically without a UI adapter.
     * @param {any} [data]
     * @param {Partial<ModelAsAppOptions>} [options]
     * @returns {Promise<any>}
     */
    static execute(data?: any, options?: Partial<ModelAsAppOptions>): Promise<any>;
    /**
     * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
     * @param {Partial<ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ModelAsApp> | Record<string, any>, options?: Partial<ModelAsAppOptions>);
    /** @type {boolean} Show help */ help: boolean;
    _: {
        adapter: InputAdapter;
        parentPath: string;
        _isExplicit: boolean;
        db: import("@nan0web/db").default | null | undefined;
        plugins: Record<string, any>;
        t: import("@nan0web/types/src/utils/TFunction").TFunction;
    };
    /**
     * Instantiates a subcommand if the value matches one of the options.
     * @param {string} key - Field name.
     * @param {any} val - Current value (string, class, or instance).
     * @param {any} [data={}] - Data to pass to the new instance.
     * @returns {any} Instantiated subcommand or original value.
     */
    _instantiateSubCommand(key: string, val: any, data?: any): any;
    /**
     * Generate help text for the model
     * @param {string} [parentPath]
     * @returns {string}
     */
    generateHelp(parentPath?: string): string;
    /**
     * Default execution generator.
     * Automatically delegates to the first instantiated subcommand field.
     *
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
export type AppOptions = {
    adapter: InputAdapter;
    parentPath: string;
    _isExplicit: boolean;
};
export type ModelAsAppOptions = import("@nan0web/types").ModelOptions & AppOptions;
import { Model } from '@nan0web/types';
import { InputAdapter } from '../core/InputAdapter.js';
