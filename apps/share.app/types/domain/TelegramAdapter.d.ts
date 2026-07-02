/**
 * TelegramAdapter
 *
 * @extends SocialAdapter
 */
export class TelegramAdapter extends SocialAdapter {
    /**
     * Capabilities supported by the Telegram platform.
     *
     * @returns {import('./Models.js').SocialAdapterCapabilities}
     */
    get capabilities(): import("./Models.js").SocialAdapterCapabilities;
    /**
     * Internal storage for published posts. Enables `delete` to operate on a
     * deterministic in‑memory representation.
     *
     * @type {Map<string, import('./Models.js').SocialAdapterContent>}
     * @private
     */
    private posts;
    /**
     * Publishes a message to Telegram (simulated).
     *
     * The method validates the content using {@link SocialAdapterContent.validate}
     * and stores the payload in an internal map so that `delete` can later remove
     * it.
     *
     * @param {import('./Models.js').SocialAdapterContent} content
     * @returns {Promise<import('./Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("./Models.js").SocialAdapterContent): Promise<import("./Models.js").SocialAdapterPublishResult>;
}
import { SocialAdapter } from './SocialAdapter.js';
