/**
 * TelegramAdapter – a mock implementation of a Telegram social adapter.
 *
 * This adapter follows the {@link SocialAdapter} contract and provides the
 * minimal set of capabilities required for the share‑app tests.
 *
 * @module TelegramAdapter
 */

import { SocialAdapter } from './SocialAdapter.js'
import {
  createLimits,
  createFeedback,
  createContent,
} from './Models.js'

/**
 * TelegramAdapter
 *
 * @extends SocialAdapter
 */
export class TelegramAdapter extends SocialAdapter {
  /**
   * Identifier of the adapter.
   *
   * @returns {string}
   */
  get id() {
    return 'telegram'
  }

  /**
   * Capabilities supported by the Telegram platform.
   *
   * @returns {import('./Models.js').SocialAdapterCapabilities}
   */
  get capabilities() {
    // Telegram can send media, delete messages and works with photos/documents.
    return ['media', 'delete', 'photo', 'document']
  }

  /**
   * Platform limits – Telegram limits a text message to 4096 characters.
   *
   * @returns {import('./Models.js').SocialAdapterLimits}
   */
  get limits() {
    return createLimits({ maxLength: 4096 })
  }

  /**
   * Internal storage for published posts. Enables `delete` to operate on a
   * deterministic in‑memory representation.
   *
   * @type {Map<string, import('./Models.js').SocialAdapterContent>}
   * @private
   */
  posts = new Map()

  /**
   * Verifies the connection configuration.
   *
   * The only required field for this mock is a Telegram bot token stored in
   * `config.credentials.token`. If the token is missing or empty an error is
   * thrown.
   *
   * @returns {Promise<boolean>}
   * @throws {Error} when the token is absent.
   */
  async verify() {
    const token = this.config.credentials?.token
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Telegram configuration error: missing token')
    }
    return true
  }

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
  async publish(content) {
    // Validation – reuse the static validator from the model.
    const { valid, errors } = createContent.validate
      ? createContent.validate(content)
      : { valid: true, errors: [] }

    if (!valid) {
      // Throw the same error type used by the rest of the codebase.
      // eslint-disable-next-line no-use-before-define
      throw new SocialAdapterValidationError(errors)
    }

    const postId = `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const payload = { ...content, id: postId, publishedAt: new Date() }

    // Store for later deletion.
    this.posts.set(postId, payload)

    return {
      id: postId,
      url: `https://t.me/${this.id}/${postId}`,
      payload,
    }
  }

  /**
   * Deletes a previously published Telegram message.
   *
   * @param {string} postId
   * @returns {Promise<boolean>}
   * @throws {Error} when the post does not exist.
   */
  async delete(postId) {
    if (!this.posts.has(postId)) {
      throw new Error('TelegramAdapter: post not found')
    }
    this.posts.delete(postId)
    return true
  }
}