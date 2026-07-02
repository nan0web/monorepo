export { NotImplementedError };
/**
 * The base protocol for all Social Network adapters (e.g. YouTube, Telegram).
 */
export class SocialAdapter extends ShareAdapter {
    /**
     * Platform-specific numeric limits.
     * @returns {import('./Models.js').SocialAdapterLimits}
     */
    get limits(): import("./Models.js").SocialAdapterLimits;
    /**
     * @param {string} capId - Capability identifier to check
     * @returns {boolean}
     */
    can(capId: string): boolean;
    /**
     * Rollback or delete a published post if supported by the platform.
     * @param {string} postId - The underlying platform's post ID.
     * @returns {Promise<boolean>}
     */
    delete(postId: string): Promise<boolean>;
    /**
     * Fetches new feedback (comments, likes) for a given post.
     * @param {string} postId
     * @returns {Promise<import('./Models.js').SocialAdapterFeedback[]>}
     */
    syncFeedback(postId: string): Promise<import("./Models.js").SocialAdapterFeedback[]>;
    /**
     * Replies to a specific comment natively on the platform.
     * @param {import('./Models.js').SocialAdapterTarget} target - Identifies the comment and network
     * @param {string} text - Reply text
     * @returns {Promise<{ id: string }>}
     */
    reply(target: import("./Models.js").SocialAdapterTarget, text: string): Promise<{
        id: string;
    }>;
    /**
     * Edits an already published post on the platform.
     * @param {string} postId - The platform's post ID to edit
     * @param {import('./Models.js').SocialAdapterContent} content - New content
     * @returns {Promise<any>}
     */
    update(postId: string, content: import("./Models.js").SocialAdapterContent): Promise<any>;
}
import { NotImplementedError } from './ShareAdapter.js';
import { ShareAdapter } from './ShareAdapter.js';
