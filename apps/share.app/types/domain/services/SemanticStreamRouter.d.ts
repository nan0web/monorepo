/**
 * @typedef {object} TranslatorPort
 * @property {(text: string, targetLocale: string, glossary?: Record<string, string>) => Promise<string>} translate
 */
/**
 * @typedef {object} RoutedIsolatedStream
 * @property {string} streamId
 * @property {string} [name]
 * @property {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
 */
/**
 * @typedef {object} RoutedExportItem
 * @property {string} streamId
 * @property {string} locale
 * @property {string} format
 * @property {string} content
 * @property {Record<string, any>} destination
 * @property {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
 */
/**
 * @typedef {object} RouteResult
 * @property {RoutedIsolatedStream[]} isolated
 * @property {RoutedExportItem[]} exports
 */
/**
 * SemanticStreamRouter — routes Markdown AST sections to configured streams,
 * enforces isolation, strips tags when requested, protects code/KaTeX, and invokes translation.
 */
export class SemanticStreamRouter {
    /**
     * Renders a document from title and selected sections.
     * @param {string} title
     * @param {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
     * @returns {string}
     */
    static renderMarkdown(title: string, sections: import("./MarkdownAstExtractor.js").ExtractedSection[]): string;
    /**
     * @param {object} [options]
     * @param {{ streams?: import('./TagLinter.js').StreamConfig[], glossary?: Record<string, string> }} [options.config]
     * @param {TranslatorPort | null} [options.translator]
     */
    constructor({ config, translator }?: {
        config?: {
            streams?: import("./TagLinter.js").StreamConfig[];
            glossary?: Record<string, string>;
        };
        translator?: TranslatorPort | null;
    });
    /** @type {{ streams: import('./TagLinter.js').StreamConfig[], glossary: Record<string, string> }} */
    config: {
        streams: import("./TagLinter.js").StreamConfig[];
        glossary: Record<string, string>;
    };
    /** @type {TranslatorPort | null} */
    translator: TranslatorPort | null;
    /**
     * Protects fenced code blocks, inline code, and KaTeX formulas ($...$, $$...$$)
     * and applies 1:1 glossary term replacements to the remaining prose.
     * @param {string} input
     * @returns {{ text: string, restore: (translated: string) => string }}
     */
    protectAndApplyGlossary(input: string): {
        text: string;
        restore: (translated: string) => string;
    };
    /**
     * Strips hashtags from text while keeping code blocks and KaTeX formulas intact.
     * @param {string} input
     * @returns {string}
     */
    stripHashtags(input: string): string;
    /**
     * Routes an extracted document across all configured streams.
     * @param {import('./MarkdownAstExtractor.js').ExtractedDocument} extractedDoc
     * @returns {Promise<RouteResult>}
     */
    route(extractedDoc: import("./MarkdownAstExtractor.js").ExtractedDocument): Promise<RouteResult>;
}
export type TranslatorPort = {
    translate: (text: string, targetLocale: string, glossary?: Record<string, string>) => Promise<string>;
};
export type RoutedIsolatedStream = {
    streamId: string;
    name?: string;
    sections: import("./MarkdownAstExtractor.js").ExtractedSection[];
};
export type RoutedExportItem = {
    streamId: string;
    locale: string;
    format: string;
    content: string;
    destination: Record<string, any>;
    sections: import("./MarkdownAstExtractor.js").ExtractedSection[];
};
export type RouteResult = {
    isolated: RoutedIsolatedStream[];
    exports: RoutedExportItem[];
};
