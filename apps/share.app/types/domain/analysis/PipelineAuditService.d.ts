/**
 * PipelineAuditService — verifies output integrity of generated video slices, subtitles, articles, and social kits.
 */
export class PipelineAuditService {
    /**
     * Inspects files created in output directory.
     * @param {string} outputDir
     * @param {Array<object>} [segments=[]]
     * @param {import('@nan0web/db').DB} [db]
     * @returns {Promise<{ videoSlices: number, subtitles: number, articles: number, socialKits: number, emptyFiles: string[] }>}
     */
    static audit(outputDir: string, segments?: Array<object>, db?: import("@nan0web/db").DB): Promise<{
        videoSlices: number;
        subtitles: number;
        articles: number;
        socialKits: number;
        emptyFiles: string[];
    }>;
}
