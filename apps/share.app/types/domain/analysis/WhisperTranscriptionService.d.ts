/**
 * WhisperTranscriptionService — manages audio downloading, chunked Whisper transcription,
 * and persistent hierarchical caching.
 */
export class WhisperTranscriptionService {
    /**
     * Factory for MediaDownloadModel (overridable in tests).
     * @param {object} data
     * @param {object} context
     * @returns {MediaDownloadModel}
     */
    static createDownloadModel(data: object, context: object): MediaDownloadModel;
    /**
     * Ensures transcript is available for the given URL/file.
     * @param {object} options
     * @param {string} options.url
     * @param {string} options.outputDir
     * @param {string} [options.language='auto']
     * @param {string} [options.quality='medium']
     * @param {Function} options.t
     * @param {object} options.context
     * @param {import('@nan0web/db').DB} [options.db]
     * @returns {AsyncGenerator<any, { whisperJson: object|null, transcriptPath: string }, any>}
     */
    static transcribe(options: {
        url: string;
        outputDir: string;
        language?: string;
        quality?: string;
        t: Function;
        context: object;
        db?: import("@nan0web/db").DB;
    }): AsyncGenerator<any, {
        whisperJson: object | null;
        transcriptPath: string;
    }, any>;
}
import { MediaDownloadModel } from '../MediaDownloadModel.js';
