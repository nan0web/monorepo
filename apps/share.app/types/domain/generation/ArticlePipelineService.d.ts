/**
 * ArticlePipelineService — handles generation of overview chapters, individual episode articles,
 * master long-read, and social distribution kits.
 */
export class ArticlePipelineService {
    /**
     * @param {object} options
     * @param {string} options.url
     * @param {string} options.outputDir
     * @param {Array<object>} options.segments
     * @param {object} options.whisperJson
     * @param {string} [options.template='tech']
     * @param {string} [options.language='auto']
     * @param {string} [options.model]
     * @param {string} [options.sources]
     * @param {boolean} [options.overview=true]
     * @param {boolean} [options.article=true]
     * @param {Function} options.t
     * @param {import('@nan0web/db').DB} [options.db]
     */
    static process(options: {
        url: string;
        outputDir: string;
        segments: Array<object>;
        whisperJson: object;
        template?: string;
        language?: string;
        model?: string;
        sources?: string;
        overview?: boolean;
        article?: boolean;
        t: Function;
        db?: import("@nan0web/db").DB;
    }): AsyncGenerator<string | import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, void, unknown>;
}
