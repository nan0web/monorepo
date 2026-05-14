/**
 * ProvenDocsAuditor — Verifies documentation structure, links, anchors, and consistency.
 */
export class ProvenDocsAuditor extends AuditorModel {
    static depth: {
        type: string;
        default: number;
        help: string;
    };
    /** @type {Object<string, string>} UI messages for audit steps */
    static UI: {
        [x: string]: string;
    };
    /**
     * Standardizes text into a URL-friendly slug.
     * @param {string} text - Input text.
     * @returns {string} Normalized slug.
     */
    static slugify(text: string): string;
    /**
     * Extracts all links and headers from document content.
     * @param {string} content - Markdown content.
     * @returns {{ links: { text: string, href: string }[], headers: Set<string> }}
     */
    static parseDocInfo(content: string): {
        links: {
            text: string;
            href: string;
        }[];
        headers: Set<string>;
    };
    /**
     * @param {Partial<ProvenDocsAuditor>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ProvenDocsAuditor>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {number} */
    depth: number;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
