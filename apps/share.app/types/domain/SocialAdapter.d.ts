export class NotImplementedError extends Error {
    constructor(method: any);
}
/**
 * The base protocol that every Sovereign Social Distribution Adapter must implement.
 * Unifies API and Playwright based platforms under a single interface.
 */
export class SocialAdapter {
    /**
     * @param {import('./Models.js').SocialAdapterConfig} config
     */
    constructor(config?: import("./Models.js").SocialAdapterConfig);
    /** @type {import('./Models.js').SocialAdapterConfig} */
    config: import("./Models.js").SocialAdapterConfig;
    /**
     * The unique identifier for this adapter (e.g. 'telegram', 'facebook', 'dummy').
     * @returns {string}
     */
    get id(): string;
    /**
     * Array of capability tokens describing what this platform supports.
     * Standard tokens: 'media', 'delete', 'reply', 'threads', 'photo', 'video', 'document', 'audio'
     * @returns {import('./Models.js').SocialAdapterCapabilities}
     */
    get capabilities(): import("./Models.js").SocialAdapterCapabilities;
    /**
     * Platform-specific numeric limits.
     * @returns {import('./Models.js').SocialAdapterLimits}
     */
    get limits(): import("./Models.js").SocialAdapterLimits;
    /**
     * @param {string} cap - Capability token to check
     * @returns {boolean}
     */
    can(cap: string): boolean;
    /**
     * Verifies the connection to the platform using the provided config.
     * Should throw an error if validation fails.
     * @returns {Promise<boolean>}
     */
    verify(): Promise<boolean>;
    /**
     * Publishes new content to the platform.
     * Content options (parseMode, disableNotification, etc.) are part of `content.options`.
     *
     * @param {import('./Models.js').SocialAdapterContent} content
     * @returns {Promise<import('./Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("./Models.js").SocialAdapterContent): Promise<import("./Models.js").SocialAdapterPublishResult>;
    /**
     * Rollback or delete a published post if supported by the platform.
     * @param {string} postId - The underlying platform's post ID.
     * @returns {Promise<boolean>}
     */
    delete(postId: string): Promise<boolean>;
    /**
     * Fetches new feedback (comments, likes) for a given post.
     * Used by connect.app to aggregate reactions.
     *
     * @param {string} postId
     * @returns {Promise<import('./Models.js').SocialAdapterFeedback[]>}
     */
    syncFeedback(postId: string): Promise<import("./Models.js").SocialAdapterFeedback[]>;
    /**
     * Replies to a specific comment natively on the platform.
     * The target contains both the comment ID and the network identifier,
     * enabling multi-account scenarios where different accounts reply on different networks.
     *
     * @param {import('./Models.js').SocialAdapterTarget} target - Identifies the comment and network
     * @param {string} text - Reply text
     * @returns {Promise<{ id: string }>}
     */
    reply(target: import("./Models.js").SocialAdapterTarget, text: string): Promise<{
        id: string;
    }>;
    /**
     * Edits an already published post on the platform.
     * Only available if the adapter declares the 'edit' capability.
     *
     * @param {string} postId - The platform's post ID to edit
     * @param {import('./Models.js').SocialAdapterContent} content - New content
     * @returns {Promise<import('./Models.js').SocialAdapterPublishResult>}
     */
    update(postId: string, content: import("./Models.js").SocialAdapterContent): Promise<import("./Models.js").SocialAdapterPublishResult>;
}
