export class DummyAdapterConfig extends SocialAdapterConfig {
    static rejectVerify: {
        help: string;
        default: boolean;
    };
    /** @type {boolean} */
    rejectVerify: boolean;
}
/**
 * A perfectly implemented mock adapter used as a reference point (Reference Architecture)
 * and for integration testing the Rules Engine without hitting live APIs.
 *
 * @example
 * const dummy = new DummyAdapter({ account: 'test-author' })
 * await dummy.publish({ text: 'Hello world!', tags: ['public'] })
 */
export class DummyAdapter extends SocialAdapter {
    /**
     * @param {ConstructorParameters<typeof DummyAdapterConfig>[0]} config
     */
    constructor(config?: ConstructorParameters<typeof DummyAdapterConfig>[0]);
    /** @type {DummyAdapterConfig} */
    config: DummyAdapterConfig;
    /** @type {Map<string, import('./Models.js').SocialAdapterContent>} */
    posts: Map<string, import("./Models.js").SocialAdapterContent>;
    /** @type {Map<string, { text: string, replyTo: string, author: string }>} */
    comments: Map<string, {
        text: string;
        replyTo: string;
        author: string;
    }>;
    get capabilities(): string[];
    /**
     * @param {import('./Models.js').SocialAdapterContent} content
     * @returns {Promise<import('./Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("./Models.js").SocialAdapterContent): Promise<import("./Models.js").SocialAdapterPublishResult>;
    delete(postId: any): Promise<boolean>;
}
import { SocialAdapterConfig } from './Models.js';
import { SocialAdapter } from './SocialAdapter.js';
