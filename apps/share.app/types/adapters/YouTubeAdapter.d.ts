export class YouTubeAdapterConfig extends SocialAdapterConfig {
    static clientId: {
        help: string;
        default: any;
    };
    static clientSecret: {
        help: string;
        default: any;
    };
    static refreshToken: {
        help: string;
        default: any;
    };
    /**
     * @param {{ clientId: string, clientSecret: string, refreshToken: string } & Partial<import('../domain/Models.js').SocialAdapterConfig>} raw
     */
    constructor(raw?: {
        clientId: string;
        clientSecret: string;
        refreshToken: string;
    } & Partial<import("../domain/Models.js").SocialAdapterConfig>);
    /** @type {string} */
    clientId: string;
    /** @type {string} */
    clientSecret: string;
    /** @type {string} */
    refreshToken: string;
}
/**
 * YouTubeAdapter
 *
 * Publishes videos and shorts to YouTube via googleapis.
 */
export class YouTubeAdapter extends SocialAdapter {
    /**
     * @param {ConstructorParameters<typeof YouTubeAdapterConfig>[0]} config
     */
    constructor(config?: ConstructorParameters<typeof YouTubeAdapterConfig>[0]);
    get capabilities(): string[];
    /**
     * Creates OAuth2 client.
     * @returns {any}
     */
    _getAuthClient(): any;
    /**
     * @param {import('../domain/Models.js').SocialAdapterContent} content
     * @returns {Promise<import('../domain/Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("../domain/Models.js").SocialAdapterContent): Promise<import("../domain/Models.js").SocialAdapterPublishResult>;
}
import { SocialAdapterConfig } from '../domain/Models.js';
import { SocialAdapter } from '../domain/SocialAdapter.js';
