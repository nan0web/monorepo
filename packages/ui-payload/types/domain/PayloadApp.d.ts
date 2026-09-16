/**
 * @typedef {Object} AppOptions
 * @property {import('payload').Payload} [payload]
 * @property {any} [config]
 */
/** @typedef {import('@nan0web/ui').ModelAsAppOptions & AppOptions} PayloadAppOptions */
/**
 * PayloadApp
 * Base application class for Payload CMS subcommands (SeedModel, TransformModel, etc.)
 * @extends {ModelAsApp}
 */
export class PayloadApp extends ModelAsApp {
    /**
     * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
     * @param {Partial<PayloadAppOptions>} [options={}]
     */
    constructor(data?: Partial<ModelAsApp> | Record<string, any>, options?: Partial<PayloadAppOptions>);
    _: {
        payload: import("payload").BasePayload | null;
        config: any;
        adapter: import("@nan0web/ui").InputAdapter;
        parentPath: string;
        _isExplicit: boolean;
        db: import("@nan0web/db").default | null | undefined;
        plugins: Record<string, any>;
        t: import("@nan0web/types/src/utils/TFunction").TFunction;
    };
    /**
     * Lazily initializes and returns the Payload Local API instance.
     * @returns {Promise<import('payload').Payload>}
     */
    getPayloadInstance(): Promise<import("payload").Payload>;
}
export type AppOptions = {
    payload?: import("payload").BasePayload | undefined;
    config?: any;
};
export type PayloadAppOptions = import("@nan0web/ui").ModelAsAppOptions & AppOptions;
import { ModelAsApp } from '@nan0web/ui';
