/**
 * ThumbnailGenerator
 *
 * Generates layered thumbnails with custom backgrounds, subjects, and text overlays.
 */
export class ThumbnailGenerator {
    /**
     * Composes a layered thumbnail image.
     * @param {string} bgPath - Background image path
     * @param {string} subjectPath - Subject image path
     * @param {Array<string>} text - Text elements to render
     * @returns {Promise<ResultIntent & { outputPath: string }>}
     */
    compose(bgPath: string, subjectPath: string, text: Array<string>): Promise<ResultIntent & {
        outputPath: string;
    }>;
}
import { ResultIntent } from '../Models.js';
