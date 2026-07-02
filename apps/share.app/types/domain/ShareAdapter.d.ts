export class NotImplementedError extends Error {
    constructor(method: any);
}
/**
 * Base abstract class for all publication adapters.
 */
export class ShareAdapter extends Model {
    config: import("./Models.js").SocialAdapterConfig;
    /**
     * Unique identifier of the adapter instance/platform (e.g. 'youtube', 'etsy').
     * @returns {string}
     */
    get id(): string;
    /**
     * Declared capabilities of this adapter.
     * @returns {import('./Capability.js').Capability[]|string[]}
     */
    get capabilities(): import("./Capability.js").Capability[] | string[];
    /**
     * Verifies connection/credentials for the platform.
     * @returns {Promise<boolean>}
     */
    verify(): Promise<boolean>;
    /**
     * Publishes content on the platform.
     * @param {any} content
     * @returns {Promise<any>}
     */
    publish(content: any): Promise<any>;
}
import { Model } from './Models.js';
