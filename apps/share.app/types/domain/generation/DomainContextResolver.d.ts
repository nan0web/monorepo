/**
 * DomainContextResolver - scans local repositories and packages to build Ground Truth context
 * to prevent Whisper speech-to-text hallucinations in LLM article generation.
 */
export class DomainContextResolver {
    /**
     * Common phonetic corrections for audio transcription.
     */
    static PHONETIC_CORRECTIONS: {
        pattern: RegExp;
        replacement: string;
    }[];
    /**
     * Scans given source directory paths (comma-separated or array) and extracts package names,
     * descriptions, and key README information.
     * @param {string|string[]} sourcePaths
     * @returns {object} { summary: string, packages: Array<{name: string, path: string, description: string}> }
     */
    static scanSources(sourcePaths: string | string[]): object;
    /**
     * Cleans and corrects phonetic errors from raw audio transcripts.
     * @param {string} text
     * @returns {string}
     */
    static sanitizeTranscript(text: string): string;
}
