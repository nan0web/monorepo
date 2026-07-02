/**
 * VideoCompiler
 *
 * Compiles a video collage based on audio, video, or TTS text sources.
 */
export class VideoCompiler {
    /**
     * @param {string} episodeDir
     */
    constructor(episodeDir: string);
    /** @type {string} */
    episodeDir: string;
    /**
     * Compiles the video collage.
     * @param {'audio'|'video'|'text'} sourceType
     * @returns {Promise<ResultIntent & { outputPath: string }>}
     */
    compile(sourceType: "audio" | "video" | "text"): Promise<ResultIntent & {
        outputPath: string;
    }>;
}
import { ResultIntent } from '../Models.js';
