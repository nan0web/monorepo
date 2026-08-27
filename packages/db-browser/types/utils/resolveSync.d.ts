/**
 * Resolves path segments to absolute URL synchronously
 * @param {{ cwd?: string, root?: string }} context - Context with cwd and root properties
 * @param {...string} args - Path segments
 * @returns {string} Resolved absolute URL
 */
export function resolveSync(context: {
    cwd?: string;
    root?: string;
}, ...args: string[]): string;
