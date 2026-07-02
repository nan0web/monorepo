export class MediumAdapterConfig extends SocialAdapterConfig {
    static token: {
        help: string;
        default: any;
    };
    static userId: {
        help: string;
        default: any;
    };
    /**
     * @param {{ token: string, userId?: string } & Partial<import('../domain/Models.js').SocialAdapterConfig>} raw
     */
    constructor(raw?: {
        token: string;
        userId?: string;
    } & Partial<import("../domain/Models.js").SocialAdapterConfig>);
    /** @type {string} */
    token: string;
    /** @type {string|undefined} */
    userId: string | undefined;
}
/**
 * MediumAdapter
 *
 * Publishes stories/articles to Medium.
 */
export class MediumAdapter extends SocialAdapter {
    /**
     * @param {ConstructorParameters<typeof MediumAdapterConfig>[0]} config
     */
    constructor(config?: ConstructorParameters<typeof MediumAdapterConfig>[0]);
    get capabilities(): string[];
    /**
     * @param {import('../domain/Models.js').SocialAdapterContent} content
     * @returns {Promise<import('../domain/Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("../domain/Models.js").SocialAdapterContent): Promise<import("../domain/Models.js").SocialAdapterPublishResult>;
}
import { SocialAdapterConfig } from '../domain/Models.js';
import { SocialAdapter } from '../domain/SocialAdapter.js';
