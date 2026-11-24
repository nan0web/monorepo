/**
 * MarkdownAstExtractor — parses Markdown into structured H2 sections using @nan0web/markdown AST.
 */
export class MarkdownAstExtractor {
    /**
     * Extracts title, H2 sections, tags, and exact 1-based line occurrences from raw Markdown.
     * @param {string} raw
     * @returns {ExtractedDocument}
     */
    extract(raw: string): ExtractedDocument;
}
export type TagOccurrence = {
    tag: string;
    line: number;
    section: string;
};
export type ExtractedSection = {
    title: string;
    heading: string;
    level: number;
    content: string;
    elements: import("@nan0web/markdown").MDElement[];
    tags: string[];
    tagOccurrences: TagOccurrence[];
};
export type ExtractedDocument = {
    title: string;
    sections: ExtractedSection[];
};
