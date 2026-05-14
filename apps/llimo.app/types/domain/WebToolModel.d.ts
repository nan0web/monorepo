/**
 * Model-as-Schema for a Web Extractor Tool (Proxy @web)
 */
export class WebToolModel extends Model {
    static url: {
        help: string;
        default: string;
        type: string;
        validate: (val: any) => true | "Invalid URL format";
    };
    static engines: {
        help: string;
        default: string[];
        type: string;
        options: string[];
        validate: (val: any) => true | "At least one engine must be provided for fallback";
    };
    /**
     * @param {Partial<WebToolModel>} data
     * @param {Partial<import('@nan0web/types').ModelOptions>} options
     */
    constructor(data?: Partial<WebToolModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} URL to the web document or API that the agent wants to read */ url: string;
    /** @type {string[]} Fallback strategy array of execution engines to try sequentially until success */ engines: string[];
}
import { Model } from '@nan0web/types';
