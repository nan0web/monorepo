/**
 * Parse a single audit block (the part between the top and bottom border).
 *
 * @param {string} str
 * @returns {AuditIssue}
 */
export function parseAuditBlock(str: string): AuditIssue;
/**
 * Parse the whole audit output – potentially many blocks.
 *
 * @param {string} text
 * @returns {AuditIssue[]}
 */
export function parseAuditResult(text: string): AuditIssue[];
import AuditIssue from "./AuditIssue.js";
