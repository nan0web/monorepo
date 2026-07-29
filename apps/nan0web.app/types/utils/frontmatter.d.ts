/**
 * Extract frontmatter and body from a markdown string.
 * Tries NaN0 parse first, then YAML fallback.
 *
 * @param {string} raw - Raw file content (markdown with optional frontmatter).
 * @returns {Promise<{ meta: any, body: string }>}
 */
export function extractFrontmatter(raw: string): Promise<{
    meta: any;
    body: string;
}>;
/**
 * Synchronous version using simple YAML-like key:value parser.
 * Does NOT require external dependencies — perfect for buildNavTree.
 *
 * Handles:
 *   title: Some Title
 *   order: 3
 *   icon: 🔧
 *   hidden: true
 *   layout: list
 *
 * @param {string} raw
 * @returns {{ meta: object, body: string }}
 */
export function extractFrontmatterSync(raw: string): {
    meta: object;
    body: string;
};
export default extractFrontmatter;
