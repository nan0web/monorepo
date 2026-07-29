/**
 * StoreRegistryModel — Схема одиничного запису в Глобальному Реєстрі.
 * Відповідає стандарту Model-as-Schema v2.
 */
export class StoreRegistryModel extends Model {
    static UI: {
        labelName: string;
        labelPath: string;
        labelVersion: string;
        errorInvalidVersion: string;
    };
    static appName: {
        alias: string;
        type: string;
        required: boolean;
    };
    static workspace: {
        type: string;
        options: string[];
        default: string;
    };
    static relPath: {
        alias: string;
        type: string;
        required: boolean;
    };
    static tags: {
        type: string;
        default: string;
    };
    static version: {
        type: string;
        default: string;
        validate: (v: any) => string | true;
    };
    static description: {
        type: string;
        default: string;
    };
    /**
     * @param {Partial<StoreRegistryModel> | Record<string, any>} [data] Initial state
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
     */
    constructor(data?: Partial<StoreRegistryModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */ appName: string;
    /** @type {string} */ workspace: string;
    /** @type {string} */ relPath: string;
    /** @type {string} */ tags: string;
    /** @type {string} */ version: string;
    /** @type {string} */ description: string;
}
export default StoreRegistryModel;
import { Model } from '@nan0web/types';
