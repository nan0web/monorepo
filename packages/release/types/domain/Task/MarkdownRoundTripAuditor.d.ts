/**
 * MarkdownRoundTripAuditor
 * Compares original markdown with its AST-serialized representation.
 * Detects structural and content drift to ensure zero-drift roundtrip.
 */
export class MarkdownRoundTripAuditor extends AuditorModel {
    static UI: {
        drift_detected: string;
        audit_success: string;
    };
    /**
     * Normalizes markdown text by trimming trailing whitespace per line, collapsing multiple blank lines, and matching newlines.
     * @param {string} text
     * @returns {string}
     */
    static normalize(text: string): string;
    /**
     * Compute differences between original and serialized markdown.
     * @param {string} original
     * @param {string} serialized
     * @returns {{ matches: boolean, diff: string }}
     */
    static compare(original: string, serialized: string): {
        matches: boolean;
        diff: string;
    };
    /**
     * Audits round-trip for markdown text.
     * @param {string} markdownText
     * @returns {{ matches: boolean, diff: string, ast: Markdown }}
     */
    static audit(markdownText: string): {
        matches: boolean;
        diff: string;
        ast: Markdown;
    };
    /**
     * Execute generator for OLMUI compatibility.
     */
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export default MarkdownRoundTripAuditor;
import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel';
import { Markdown } from '@nan0web/markdown';
