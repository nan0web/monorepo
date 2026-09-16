/**
 * ArticleGenerator - transforms raw audio transcripts into clean, structured Markdown articles, SMM posts, TLDR digests, and social distribution packages via LLM.
 */
export class ArticleGenerator {
    /**
     * Resolves ISO 639-1 language code and display name.
     * @param {string} [lang]
     * @param {string} [sampleText]
     * @returns {{ code: string, name: string, isUk: boolean }}
     */
    static resolveLanguage(lang?: string, sampleText?: string): {
        code: string;
        name: string;
        isUk: boolean;
    };
    static getTemplates(langCode?: string): {
        tech: {
            role: string;
            label: string;
            headingEmoji: string;
            system: string;
        };
        smm: {
            role: string;
            label: string;
            headingEmoji: string;
            system: string;
        };
        tldr: {
            role: string;
            label: string;
            headingEmoji: string;
            system: string;
        };
    };
    /**
     * Cleans spoken filler words, stuttering, and raw transcription artifacts.
     * @param {string} rawText
     * @returns {string}
     */
    static cleanSpokenText(rawText: string): string;
    /**
     * Formats a single episode into a standalone publication-ready article based on template.
     * Async generator yielding OLMUI progress intents during token streaming.
     * @param {object} episode
     * @param {number} episodeIndex
     * @param {object} [options]
     * @returns {AsyncGenerator<import('@nan0web/ui').ProgressIntent, string, void>}
     */
    static generateEpisodeArticle(episode: object, episodeIndex: number, options?: object): AsyncGenerator<import("@nan0web/ui").ProgressIntent, string, void>;
    /**
     * Generates master structured long-read article consolidating all chapters (reuses per-episode results).
     * @param {Array<object>} episodes
     * @param {Array<string>} [episodeDocs]
     * @param {object} [options]
     * @returns {string}
     */
    static generateMasterFromDocs(episodes: Array<object>, episodeDocs?: Array<string>, options?: object): string;
    /**
     * Generates a full social multi-platform distribution package:
     * - Per-episode posts: `social/episodes/episode_N.{threads.md, telegram.md, youtube.json}`
     * - Channel master digest: `social/threads.md`, `social/telegram.md`, `social/youtube-meta.json`
     *
     * @param {Array<object>} episodes
     * @param {object} [options]
     * @returns {Promise<{ threads: string, telegram: string, youtube: object, episodeSocials: Array<{ label: string, index: number, threads: string, telegram: string, youtube: object }> }>}
     */
    static generateSocialDistributionPackage(episodes: Array<object>, options?: object): Promise<{
        threads: string;
        telegram: string;
        youtube: object;
        episodeSocials: Array<{
            label: string;
            index: number;
            threads: string;
            telegram: string;
            youtube: object;
        }>;
    }>;
}
